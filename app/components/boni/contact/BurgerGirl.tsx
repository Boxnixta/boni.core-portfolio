"use client";

import { useEffect, useRef, useState } from "react";

/*
  Two drawings that REPLACE each other (never both visible, so the lines don't double up).
  Idle: switches back and forth at random intervals.
  Hover: shows the second drawing until the pointer leaves.
*/
const SRC = ["/img/contact/Illustration-Eating-Burger-1.png", "/img/contact/Illustration-Eating-Burger-2.png"];

const BurgerGirl = () => {
    const [frame, setFrame] = useState(0);
    const hovering = useRef(false);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let timer: ReturnType<typeof setTimeout>;
        const tick = (current: number) => {
            // frame 1 (eyes closed) stays short, frame 0 stays longer
            const wait = current === 1 ? 250 + Math.random() * 600 : 1200 + Math.random() * 3500;
            timer = setTimeout(() => {
                const next = hovering.current ? 1 : current === 0 ? 1 : 0;
                if (!hovering.current) setFrame(next);
                tick(next);
            }, wait);
        };
        tick(0);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div
            className="burger-girl"
            onPointerEnter={() => { hovering.current = true; setFrame(1); }}
            onPointerLeave={() => { hovering.current = false; setFrame(0); }}
        >
            {SRC.map((src, i) => (
                // both are in the DOM (no loading flicker), only one is displayed
                // eslint-disable-next-line @next/next/no-img-element
                <img
                    key={src}
                    src={src}
                    alt={i === 0 ? "Illustration of Bonita eating a burger" : ""}
                    className={frame === i ? "block" : "hidden"}
                    draggable={false}
                />
            ))}
        </div>
    );
};

export default BurgerGirl;
