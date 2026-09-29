"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";

/*
  Three.js needs window/document, so the canvas is loaded only in the browser
  (ssr: false) — same idea as the dynamic import("p5") in tutorial chapter 16.
*/
const CursorCanvas = dynamic(() => import("./CursorCanvas"), { ssr: false });

/*
  Only shown on devices with a real mouse (no touch screens) and when the
  user has not asked the OS for reduced motion. Everyone else keeps the
  normal cursor.
*/
const CursorLayer = () => {
    const [enabled, setEnabled] = useState(false);

    useEffect(() => {
        const fine = window.matchMedia("(pointer: fine)");
        const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
        const update = () => setEnabled(fine.matches && !calm.matches);
        update();
        fine.addEventListener("change", update);
        calm.addEventListener("change", update);
        return () => {
            fine.removeEventListener("change", update);
            calm.removeEventListener("change", update);
        };
    }, []);

    return enabled ? <CursorCanvas /> : null;
};

export default CursorLayer;
