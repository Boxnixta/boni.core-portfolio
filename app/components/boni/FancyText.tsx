"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/*
  Headline style from the old portfolio:
  letter 1 = script, letter 2 = normal, letters 3–4 = pixel, everything after = normal.
  e.g. "Portfoliooo" → P (script) o (normal) r t (pixel) folioo (normal).

  On page load and on hover the first 6 letters shuffle through random fonts
  for about half a second, then settle back into the fixed order.

  Fixed grid: each of the first 6 letters gets a fixed-width box (measured in its
  base font, stored in em). Whatever font a letter shows during the shuffle,
  it stays centred in its box, so the word never grows or shrinks.

  Screen readers read the plain text (sr-only); the styled letters are hidden from them.
*/
const FONTS = ["fancy-script", "", "fancy-pixel"];
const BASE = ["fancy-script", "", "fancy-pixel", "fancy-pixel", "", ""];
const STEPS = 7; // shuffle frames
const FRAME_MS = 70;

// useLayoutEffect warns during static rendering; this falls back to useEffect there
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const FancyText = ({ text, label }: { text: string; label?: string }) => {
    const [classes, setClasses] = useState(BASE);
    const [widths, setWidths] = useState<(string | undefined)[]>([]);
    const running = useRef(false);
    const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

    // Measure the first 6 letters in their base fonts, once the web fonts are loaded
    useIsoLayoutEffect(() => {
        let cancelled = false;
        const measure = () => {
            if (cancelled) return;
            const w = letterRefs.current.slice(0, BASE.length).map((el) => {
                if (!el) return undefined;
                const fontSize = parseFloat(getComputedStyle(el).fontSize) || 16;
                return `${el.getBoundingClientRect().width / fontSize}em`;
            });
            setWidths(w);
        };
        if (document.fonts?.ready) document.fonts.ready.then(measure);
        else measure();
        return () => {
            cancelled = true;
        };
    }, [text]);

    const shuffle = useCallback(() => {
        if (running.current || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        running.current = true;
        let step = 0;
        const id = setInterval(() => {
            step++;
            if (step >= STEPS) {
                clearInterval(id);
                setClasses(BASE);
                running.current = false;
                return;
            }
            setClasses(BASE.map(() => FONTS[Math.floor(Math.random() * FONTS.length)]));
        }, FRAME_MS);
    }, []);

    // shuffle once after load — but only after the widths are locked
    const measured = widths.length > 0;
    useEffect(() => {
        if (measured) shuffle();
    }, [measured, shuffle]);

    // count only visible letters, so spaces don't shift the pattern
    let n = -1;
    return (
        <>
            <span className="sr-only">{label ?? text}</span>
            <span aria-hidden="true" className="fancy-text" onPointerEnter={shuffle}>
                {text.split("").map((ch, i) => {
                    if (ch === " ") return <span key={i}>{" "}</span>;
                    n++;
                    const idx = n;
                    if (idx >= BASE.length) return <span key={i}>{ch}</span>;
                    return (
                        // outer box = fixed width in the heading's em; inner span = the changing font
                        <span
                            key={i}
                            ref={(el) => {
                                letterRefs.current[idx] = el;
                            }}
                            className="fancy-slot"
                            style={widths[idx] ? { width: widths[idx] } : undefined}
                        >
                            <span className={classes[idx]}>{ch}</span>
                        </span>
                    );
                })}
            </span>
        </>
    );
};

export default FancyText;
