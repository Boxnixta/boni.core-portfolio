"use client";

import { useEffect, useRef } from "react";

/*
  Moves its children DOWN while the page scrolls down (vertical only).
  speed 0.2 = the element travels 20% of the scroll distance, so it seems
  to float slower than the rest of the page. max limits the travel in px.
  Written straight to style.transform in a rAF → no React re-renders.
*/
const Parallax = ({
    children,
    speed = 0.2,
    max = 400,
    className = "",
}: {
    children: React.ReactNode;
    speed?: number;
    max?: number;
    className?: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        let frame = 0;
        const update = () => {
            frame = 0;
            const y = Math.min(window.scrollY * speed, max);
            if (ref.current) ref.current.style.transform = `translate3d(0, ${y}px, 0)`;
        };
        // Throttle to one update per animation frame
        const onScroll = () => {
            if (!frame) frame = requestAnimationFrame(update);
        };
        update();
        window.addEventListener("scroll", onScroll, { passive: true });
        return () => {
            window.removeEventListener("scroll", onScroll);
            cancelAnimationFrame(frame);
        };
    }, [speed, max]);

    return (
        <div ref={ref} className={`will-change-transform ${className}`}>
            {children}
        </div>
    );
};

export default Parallax;
