"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/*
  Headline style from the old portfolio:
  letter 1 = script, letter 2 = normal, letters 3–4 = pixel, everything after = normal.
  e.g. "Portfoliooo" → P (script) o (normal) r t (pixel) folioo (normal).

  On page load and on hover the first 6 letters shuffle through random fonts
  for about half a second, then settle back into the fixed order.
  Screen readers read the plain text (sr-only); the styled letters are hidden from them.
*/
const FONTS = ["fancy-script", "", "fancy-pixel"];
const BASE = ["fancy-script", "", "fancy-pixel", "fancy-pixel", "", ""];
const STEPS = 7; // shuffle frames
const FRAME_MS = 70;

const FancyText = ({ text, label }: { text: string; label?: string }) => {
    const [classes, setClasses] = useState(BASE);
    const running = useRef(false);

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

    // once after the page has loaded in the browser
    useEffect(() => {
        shuffle();
    }, [shuffle]);

    // count only visible letters, so spaces don't shift the pattern
    let n = -1;
    return (
        <>
            <span className="sr-only">{label ?? text}</span>
            <span aria-hidden="true" className="fancy-text" onPointerEnter={shuffle}>
                {text.split("").map((ch, i) => {
                    if (ch === " ") return <span key={i}>{" "}</span>;
                    n++;
                    return (
                        <span key={i} className={n < BASE.length ? classes[n] : ""}>
                            {ch}
                        </span>
                    );
                })}
            </span>
        </>
    );
};

export default FancyText;
