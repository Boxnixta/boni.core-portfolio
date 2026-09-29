"use client";

import { useEffect, useRef } from "react";

/*
  true while the pointer is over a link, button or [role="button"].
  Uses pointerover (fires once per element change) instead of checking
  elementFromPoint on every mouse move — much cheaper.
  Returns a ref so the value can be read inside useFrame without re-renders.
*/
export function useClickableHover() {
    const hovering = useRef(false);

    useEffect(() => {
        const onOver = (e: PointerEvent) => {
            const el = e.target as Element | null;
            hovering.current = !!el?.closest?.('a, button, [role="button"], summary');
        };
        window.addEventListener("pointerover", onOver);
        return () => window.removeEventListener("pointerover", onOver);
    }, []);

    return hovering;
}
