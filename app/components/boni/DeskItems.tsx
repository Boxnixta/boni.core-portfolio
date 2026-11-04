"use client";

import { useEffect, useRef } from "react";

/*
  Desk objects scattered over the landing section.
  x / y: start position in % of the section, width: size in px at a 1400px wide screen,
  rotation: in degrees. Objects are pushed away by the cursor and tilt a little.
  While an object moves it lifts off the desk: the image tips up and away from its own
  shadow (CSS vars --lift / --lx / --ly), the shadow stays and gets softer.
*/
const ITEMS = [
    { src: "/img/desk/canon.webp",      x: 55, y: 45, rotation: -200, width: 330, z: 2 },
    { src: "/img/desk/chips2.webp",     x: 25, y: 30, rotation: 8,    width: 220, z: 1 },
    { src: "/img/desk/festplatte.webp", x: 10, y: 35, rotation: -40,  width: 300, z: 3 },
    { src: "/img/desk/fischstift.webp", x: 50, y: 20, rotation: 230,  width: 80,  z: 7 },
    { src: "/img/desk/kaugummi.webp",   x: 50, y: 35, rotation: -30,  width: 150, z: 10 },
    { src: "/img/desk/lineal.webp",     x: 50, y: 25, rotation: 140,  width: 650, z: 2 },
    { src: "/img/desk/maus.webp",       x: 75, y: 40, rotation: 130,  width: 150, z: 6 },
    { src: "/img/desk/papiermull.webp", x: 40, y: 20, rotation: 6,    width: 180, z: 9 },
    { src: "/img/desk/stempel.webp",    x: 60, y: 30, rotation: -10,  width: 150, z: 7 },
    { src: "/img/desk/tastatur.webp",   x: 35, y: 30, rotation: -80,  width: 200, z: 5 },
];

const DeskItems = () => {
    const containerRef = useRef<HTMLDivElement>(null);
    const itemRefs = useRef<(HTMLDivElement | null)[]>([]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        // On narrow (portrait) screens the objects are spread over the full height,
        // otherwise they would all pile up in the upper middle.
        const narrow = container.clientWidth < 640;
        // Mutable per-frame state lives outside React state → no re-renders at 60 fps
        // x/y = position in %, vx/vy = velocity in % per frame
        const pos = ITEMS.map((it) => ({ x: it.x, y: narrow ? 8 + (it.y - 20) * 2.6 : it.y, vx: 0, vy: 0, tilt: 0, lift: 0, lx: 0, ly: 0 }));
        itemRefs.current.forEach((el, i) => {
            if (el) el.style.top = `${pos[i].y}%`;
        });
        const mouse = { x: -9999, y: -9999 };
        let frameId = 0;
        let visible = true;

        // Scale objects with the screen width so they fit on phones too
        const applyScale = () => {
            const s = Math.min(1.2, Math.max(0.45, container.clientWidth / 1400));
            itemRefs.current.forEach((el, i) => {
                if (el) el.style.width = `${ITEMS[i].width * s}px`;
            });
        };
        applyScale();
        window.addEventListener("resize", applyScale);

        // Respect "reduce motion" system setting: static desk, no animation
        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
            return () => window.removeEventListener("resize", applyScale);
        }

        // pointermove covers mouse AND touch-drag
        const onMove = (e: PointerEvent) => {
            mouse.x = e.clientX;
            mouse.y = e.clientY;
        };
        window.addEventListener("pointermove", onMove);

        // Pause the loop while the section is scrolled out of view
        const io = new IntersectionObserver(([entry]) => {
            visible = entry.isIntersecting;
            if (visible) frameId = requestAnimationFrame(animate);
        });
        io.observe(container);

        const PUSH = 0.09;     // how strongly the cursor pushes (acceleration)
        const DAMPING = 0.9;   // 1 = slides forever, 0 = stops instantly
        const BOUNCE = 0.65;   // how much speed survives a bounce off an edge
        const OUTSIDE = 0.35;  // left / right / top: max. 35% of an object may leave the desk

        function animate() {
            if (!visible || !container) return;
            const box = container.getBoundingClientRect();

            itemRefs.current.forEach((el, i) => {
                if (!el) return;
                const p = pos[i];
                const r = el.getBoundingClientRect();
                const dx = mouse.x - (r.left + r.width / 2);
                const dy = mouse.y - (r.top + r.height / 2);
                const dist = Math.hypot(dx, dy);
                const repelRadius = Math.max(r.width, r.height) * 0.8;

                if (dist < repelRadius && dist > 0) {
                    // Closer = stronger push, away from the cursor
                    const force = (repelRadius - dist) / repelRadius;
                    const angle = Math.atan2(dy, dx);
                    p.vx -= Math.cos(angle) * force * PUSH * (1400 / box.width);
                    p.vy -= Math.sin(angle) * force * PUSH * (900 / box.height);
                    p.tilt += (force * 15 - p.tilt) * 0.2;
                } else {
                    p.tilt *= 0.9; // ease back
                }

                p.vx *= DAMPING;
                p.vy *= DAMPING;
                p.x += p.vx;
                p.y += p.vy;

                // Edges: the bottom edge is solid (nothing gets cut off there),
                // the other edges let a bit of the object stick out, like on a real desk.
                // left/top position the UNROTATED box, but what you see is the rotated one
                // (e.g. the keyboard is a tall image turned by -80°). So the limits are
                // computed from the visible (rotated) size r and the unrotated size offset*.
                const offW = el.offsetWidth;
                const offH = el.offsetHeight;
                const toPctX = (px: number) => (px / box.width) * 100;
                const toPctY = (px: number) => (px / box.height) * 100;
                const minX = toPctX(-r.width * OUTSIDE + r.width / 2 - offW / 2);
                const maxX = toPctX(box.width + r.width * OUTSIDE - r.width / 2 - offW / 2);
                const minY = toPctY(-r.height * OUTSIDE + r.height / 2 - offH / 2);
                const maxY = toPctY(box.height - r.height / 2 - offH / 2 - 6); // 6px air for the shadow
                if (p.x < minX) { p.x = minX; p.vx = Math.abs(p.vx) * BOUNCE; }
                if (p.x > maxX) { p.x = maxX; p.vx = -Math.abs(p.vx) * BOUNCE; }
                if (p.y < minY) { p.y = minY; p.vy = Math.abs(p.vy) * BOUNCE; }
                if (p.y > maxY) { p.y = maxY; p.vy = -Math.abs(p.vy) * BOUNCE; }

                el.style.left = `${p.x}%`;
                el.style.top = `${p.y}%`;
                el.style.setProperty("--tilt", `${p.tilt}deg`);

                // lift: the faster it slides, the more it rises off its shadow
                const svx = (p.vx / 100) * box.width; // px per frame on screen
                const svy = (p.vy / 100) * box.height;
                const speed = Math.hypot(svx, svy);
                p.lift += (Math.min(1, speed / 5) - p.lift) * 0.12;
                // direction of travel in the object's own (rotated) frame, so the leading edge tips up
                const a = (-(ITEMS[i].rotation + p.tilt) * Math.PI) / 180;
                const dirX = speed > 0.01 ? svx / speed : 0;
                const dirY = speed > 0.01 ? svy / speed : 0;
                p.lx += ((dirX * Math.cos(a) - dirY * Math.sin(a)) * p.lift - p.lx) * 0.15;
                p.ly += ((dirX * Math.sin(a) + dirY * Math.cos(a)) * p.lift - p.ly) * 0.15;
                el.style.setProperty("--lift", p.lift.toFixed(3));
                el.style.setProperty("--lx", p.lx.toFixed(3));
                el.style.setProperty("--ly", p.ly.toFixed(3));
            });

            frameId = requestAnimationFrame(animate);
        }

        return () => {
            cancelAnimationFrame(frameId);
            io.disconnect();
            window.removeEventListener("pointermove", onMove);
            window.removeEventListener("resize", applyScale);
        };
    }, []);

    return (
        <div ref={containerRef} className="absolute inset-0 z-10" aria-hidden="true">
            {ITEMS.map((it, i) => (
                <div
                    key={it.src}
                    ref={(el) => { itemRefs.current[i] = el; }}
                    className="desk-item"
                    style={{
                        left: `${it.x}%`,
                        top: `${it.y}%`,
                        width: `${it.width}px`,
                        zIndex: it.z,
                        transform: `rotate(calc(${it.rotation}deg + var(--tilt, 0deg)))`,
                    }}
                >
                    {/* colored shadow = blurred copy of the same image (like the old three.js site) */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.src} alt="" draggable={false} className="desk-shadow" />
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.src} alt="" draggable={false} className="desk-img" />
                </div>
            ))}
        </div>
    );
};

export default DeskItems;
