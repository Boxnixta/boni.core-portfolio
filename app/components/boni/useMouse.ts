"use client";

import { useEffect, useRef } from "react";

/*
  Mouse position in normalized device coordinates (-1 … 1),
  the coordinate system Three.js uses for the viewport.
  Stored in a ref, not state: it changes every frame and must not
  trigger React re-renders.
*/
export function useMouse() {
    const mouse = useRef({ x: 0, y: 0 });

    useEffect(() => {
        const onMove = (e: PointerEvent) => {
            mouse.current.x = (e.clientX / window.innerWidth) * 2 - 1;
            mouse.current.y = -(e.clientY / window.innerHeight) * 2 + 1;
        };
        window.addEventListener("pointermove", onMove);
        return () => window.removeEventListener("pointermove", onMove);
    }, []);

    return mouse;
}
