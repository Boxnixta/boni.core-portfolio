"use client";

import { useEffect } from "react";
import { Canvas } from "@react-three/fiber";
import SootSprite from "./SootSprite";
import Star from "./Star";

/*
  Full-screen transparent WebGL layer on top of the page.
  pointer-events: none → all clicks go through to the page below.
  Orthographic camera: no perspective, the sprite looks flat like a sticker.

  The native cursor is hidden only AFTER WebGL has started (onCreated).
  If WebGL fails, the class is never added and the normal cursor stays —
  nobody ends up without a pointer.
*/
const CursorCanvas = () => {
    // Remove the class again when the layer unmounts
    useEffect(() => () => document.documentElement.classList.remove("custom-cursor"), []);

    return (
        <Canvas
            orthographic
            aria-hidden="true"
            style={{ position: "fixed", inset: 0, width: "100vw", height: "100vh", pointerEvents: "none", zIndex: 9999 }}
            camera={{ zoom: 200, position: [0, 0, 100] }}
            gl={{ antialias: true, alpha: true }}
            dpr={[1, 2]}
            onCreated={() => document.documentElement.classList.add("custom-cursor")}
        >
            <SootSprite />
            <Star />
        </Canvas>
    );
};

export default CursorCanvas;
