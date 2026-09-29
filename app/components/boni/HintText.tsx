"use client";

import { useEffect, useState } from "react";

/*
  "Scroll to see projects" slides in from the top after 1s.
  The first letters mix three typefaces (script, bold grotesk, pixel) —
  the style from the old portfolio.
*/
const letterClass = (i: number) => {
    if (i === 0 || i === 4 || i === 5) return "font-script text-[1.25em] font-normal";
    if (i === 2 || i === 3) return "font-pixel font-normal";
    return "font-bold";
};

const HintText = ({ text = "Scroll to see projects" }: { text?: string }) => {
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const t = setTimeout(() => setVisible(true), 1000);
        return () => clearTimeout(t);
    }, []);

    return (
        <div
            className={`hint-text ${visible ? "top-6 sm:top-8" : "-top-32"}`}
            aria-hidden="true"
        >
            <p className="flex items-baseline whitespace-nowrap text-boni-blue leading-none max-w-none text-[clamp(1.4rem,3.5vw,2.5rem)]">
                {text.split("").map((ch, i) =>
                    ch === " " ? (
                        <span key={i} className="w-[0.3em]" />
                    ) : (
                        <span key={i} className={`inline-block ${letterClass(i)}`}>
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
