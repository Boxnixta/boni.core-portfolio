"use client";

import { useEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import HalftoneMaterial from "./HalftoneMaterial";
import { useMouse } from "./useMouse";
import { useClickableHover } from "./useClickableHover";

const makeMaterial = (dotSize: number) => {
    const m = new HalftoneMaterial();
    m.uniforms.dotSize.value = dotSize;
    return m;
};

const COLORS = ["#ffc5f0", "#61ff61", "#ffff5c", "#82cce8", "#ffae70"];

/* Spiky halftone star that sits on the cursor. Click = next color. */
const Star = () => {
    const groupRef = useRef<THREE.Group>(null);
    const { viewport } = useThree();
    const mouse = useMouse();
    const hovering = useClickableHover();
    const colorIndex = useRef(0);

    // One material per dot size, shared by all meshes (instead of one per mesh)
    const bodyMat = useMemo(() => makeMaterial(6.0), []);
    const spikeMat = useMemo(() => makeMaterial(3.0), []);

    const setColor = (hex: string) => {
        (bodyMat.uniforms.color.value as THREE.Color).set(hex);
        (spikeMat.uniforms.color.value as THREE.Color).set(hex);
    };

    useEffect(() => {
        setColor(COLORS[0]);
        const onDown = () => {
            colorIndex.current = (colorIndex.current + 1) % COLORS.length;
            setColor(COLORS[colorIndex.current]);
        };
        window.addEventListener("pointerdown", onDown);
        return () => {
            window.removeEventListener("pointerdown", onDown);
            bodyMat.dispose();
            spikeMat.dispose();
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // One cone per icosahedron vertex, rotated to point outward
    const spikes = useMemo(() => {
        const pos = new THREE.IcosahedronGeometry(0.1, 0).attributes.position;
        const up = new THREE.Vector3(0, 1, 0);
        return Array.from({ length: pos.count }, (_, i) => {
            const position = new THREE.Vector3().fromBufferAttribute(pos, i);
            const quaternion = new THREE.Quaternion().setFromUnitVectors(up, position.clone().normalize());
            return { position, quaternion };
        });
    }, []);

    useFrame(() => {
        const g = groupRef.current;
        if (!g) return;
        g.position.set((mouse.current.x * viewport.width) / 2, (mouse.current.y * viewport.height) / 2, 1.5);
        g.rotation.x += 0.01;
        g.rotation.y += 0.015;
        // Grows a little over links and buttons
        const target = hovering.current ? 0.8 : 0.6;
        g.scale.lerp(new THREE.Vector3(target, target, target), 0.1);
    });

    return (
        <group ref={groupRef} scale={0.6}>
            <mesh material={bodyMat}>
                <sphereGeometry args={[0.08, 32, 32]} />
            </mesh>
            {spikes.map((s, i) => (
                <mesh key={i} position={s.position} quaternion={s.quaternion} material={spikeMat}>
                    <coneGeometry args={[0.07, 0.1, 16]} />
                </mesh>
            ))}
        </group>
    );
};

export default Star;
