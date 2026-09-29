"use client";

import { useRef } from "react";

/*
  Wrap any decorative image to make it grabbable (mouse + touch).
  The element stays where it is dropped: the offset is kept in a ref and
  applied as a CSS transform, so the layout around it never changes.
*/
const Draggable = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => {
    const ref = useRef<HTMLDivElement>(null);
    const offset = useRef({ x: 0, y: 0 });
    const start = useRef<{ x: number; y: number } | null>(null);

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX - offset.current.x, y: e.clientY - offset.current.y };
        e.currentTarget.classList.add("is-dragging");
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!start.current || !ref.current) return;
        offset.current = { x: e.clientX - start.current.x, y: e.clientY - start.current.y };
        ref.current.style.translate = `${offset.current.x}px ${offset.current.y}px`;
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        start.current = null;
        e.currentTarget.classList.remove("is-dragging");
    };

    return (
        <div
            ref={ref}
            className={`draggable ${className}`}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-hidden="true"
        >
            {children}
        </div>
    );
};

export default Draggable;
