"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";

/*
  "Scroll to see projects" slides in from the top after 1s.
  The first letters mix three typefaces (script, bold grotesk, pixel) —
  the style from the old portfolio.
  Like the FancyText headings: on hover the first 6 letters ("Scroll") shuffle
  through random fonts for about half a second, then settle back. Each of those
  letters sits in a fixed-width box, so the line never jumps while shuffling.
*/
const SCRIPT = "font-script text-[1.25em] font-normal";
const PIXEL = "font-pixel font-normal";
const BOLD = "font-bold";
const FONTS = [SCRIPT, PIXEL, BOLD];
const SHUFFLED = 6; // how many letters take part in the shuffle
const STEPS = 7;
const FRAME_MS = 70;

const letterClass = (i: number): string => {
    if (i === 0 || i === 4 || i === 5) return SCRIPT;
    if (i === 2 || i === 3) return PIXEL;
    return BOLD;
};

// useLayoutEffect warns during static rendering; this falls back to useEffect there
const useIsoLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;

const HintText = ({ text = "Scroll to see projects" }: { text?: string }) => {
    const [visible, setVisible] = useState(false);
    const base = text.split("").map((_, i) => letterClass(i));
    const [classes, setClasses] = useState(base);
    const [widths, setWidths] = useState<(string | undefined)[]>([]);
    const running = useRef(false);
    const letterRefs = useRef<(HTMLSpanElement | null)[]>([]);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(t);
    }, []);

    // lock the width of the shuffling letters (measured in their base font, in em)
    useIsoLayoutEffect(() => {
        let cancelled = false;
        const measure = () => {
            if (cancelled) return;
            setWidths(
                letterRefs.current.slice(0, SHUFFLED).map((el) => {
                    if (!el) return undefined;
                    const fontSize = parseFloat(getComputedStyle(el.parentElement!).fontSize) || 16;
                    return `${el.getBoundingClientRect().width / fontSize}em`;
                })
            );
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
        const baseClasses = text.split("").map((_, i) => letterClass(i));
        const id = setInterval(() => {
            step++;
            if (step >= STEPS) {
                clearInterval(id);
                setClasses(baseClasses);
                running.current = false;
                return;
            }
            setClasses(baseClasses.map((c, i) => (i < SHUFFLED ? FONTS[Math.floor(Math.random() * FONTS.length)] : c)));
        }, FRAME_MS);
    }, [text]);

    return (
        <div
            className={`hint-text ${visible ? "top-6 sm:top-8" : "-top-32"}`}
            aria-hidden="true"
        >
            <p
                className="pointer-events-auto flex items-baseline whitespace-nowrap text-boni-blue leading-none max-w-none text-[clamp(1.4rem,3.5vw,2.5rem)]"
                onPointerEnter={shuffle}
            >
                {text.split("").map((ch, i) =>
                    ch === " " ? (
                        <span key={i} className="w-[0.3em]" />
                    ) : i < SHUFFLED ? (
                        // fixed box (width locked after measuring) → the line never jumps
                        <span key={i} className="inline-block text-center" style={widths[i] ? { width: widths[i] } : undefined}>
                            <span
                                ref={(el) => {
                                    letterRefs.current[i] = el;
                                }}
                                className={`inline-block ${classes[i]}`}
                            >
                                {ch}
                            </span>
                        </span>
                    ) : (
                        <span key={i} className={`inline-block ${classes[i]}`}>
                            {ch}
                        </span>
                    )
                )}
            </p>
            <svg width="30" height="36" viewBox="0 0 30 30" className="stroke-boni-blue fill-none" strokeWidth={5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 2 L15 22" />
                <polyline points="5,15 15,25 25,15" />
            </svg>
        </div>
    );
};

export default HintText;
