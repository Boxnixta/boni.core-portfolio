"use client";

import { createRef, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMouse } from "./useMouse";

const OFFSETS = [
    { x: -0.2, y: 0.1, z: 0.02 },
    { x: 0.12, y: -0.03, z: -0.01 },
    { x: -0.05, y: -0.07, z: 0.03 },
    { x: 0.18, y: 0.12, z: -0.02 },
    { x: -0.18, y: -0.05, z: 0.01 },
    { x: 0.05, y: 0.18, z: -0.03 },
    { x: 0.0, y: -0.05, z: 0.02 },
    { x: -0.1, y: 0.15, z: -0.01 },
    { x: 0.2, y: -0.06, z: 0.0 },
];
const EYES = [
    { x: -0.15, y: 0.1 },
    { x: 0.15, y: 0.1 },
];

/*
  Blue pixel creature that follows the cursor with a delay (lerp)
  and looks at the star with its eyes. Its pixels jitter while the
  mouse is moving.
*/
const SootSprite = () => {
    const groupRef = useRef<THREE.Group>(null);
    const pupilRefs = useRef(EYES.map(() => createRef<THREE.Mesh>()));
    const squareRefs = useRef(OFFSETS.map(() => createRef<THREE.Mesh>()));
    const { viewport } = useThree();
    const mouse = useMouse();
    const lastUpdate = useRef(0);
    const lastMouse = useRef({ x: 0, y: 0 });

    const blue = useMemo(() => new THREE.MeshBasicMaterial({ color: "#0000ff", toneMapped: false }), []);
    const white = useMemo(() => new THREE.MeshBasicMaterial({ color: "white", toneMapped: false }), []);
    const black = useMemo(() => new THREE.MeshBasicMaterial({ color: "black", toneMapped: false }), []);

    useFrame(() => {
        const g = groupRef.current;
        if (!g) return;
        const tx = (mouse.current.x * viewport.width) / 2;
        const ty = (mouse.current.y * viewport.height) / 2;

        // Follow the cursor with delay: move 10% of the remaining distance per frame
        g.position.x += (tx + 0.1 - g.position.x) * 0.1;
        g.position.y += (ty - 0.1 - g.position.y) * 0.1;

        // Pupils look toward the star, limited to a small range
        const localX = (tx - g.position.x) / 0.4;
        const localY = (ty - g.position.y) / 0.4;
        EYES.forEach((eye, i) => {
            const p = pupilRefs.current[i].current;
            if (!p) return;
            const dx = localX - eye.x;
            const dy = localY - eye.y;
            const d = Math.hypot(dx, dy) || 1;
            const r = Math.min(d, 0.03);
            p.position.x = eye.x + (dx / d) * r;
            p.position.y = eye.y + (dy / d) * r;
        });

        // Jitter the pixels max. 10× per second while the mouse moves
        const now = performance.now();
        const moved =
            Math.abs(mouse.current.x - lastMouse.current.x) > 0.001 ||
            Math.abs(mouse.current.y - lastMouse.current.y) > 0.001;
        if (moved && now - lastUpdate.current > 100) {
            lastUpdate.current = now;
            lastMouse.current = { ...mouse.current };
            squareRefs.current.forEach((ref, i) => {
                if (!ref.current) return;
                ref.current.position.x = OFFSETS[i].x + (Math.random() - 0.5) * 0.25;
                ref.current.position.y = OFFSETS[i].y + (Math.random() - 0.5) * 0.25;
            });
        }
    });

    return (
        <group ref={groupRef} scale={0.4}>
            {OFFSETS.map((o, i) => (
                <mesh key={i} ref={squareRefs.current[i]} position={[o.x, o.y, o.z]} material={blue}>
                    <planeGeometry args={[0.2, 0.2]} />
                </mesh>
            ))}
            {EYES.map((eye, i) => (
                <group key={i}>
                    <mesh position={[eye.x, eye.y, 0.2]} material={white}>
                        <circleGeometry args={[0.09, 32]} />
                    </mesh>
                    <mesh ref={pupilRefs.current[i]} position={[eye.x, eye.y, 0.25]} material={black}>
                        <circleGeometry args={[0.05, 32]} />
                    </mesh>
                </group>
            ))}
        </group>
    );
};

export default SootSprite;
