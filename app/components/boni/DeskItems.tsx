"use client";

import { useEffect, useRef } from "react";

/*
  Desk objects scattered over the landing section.
  x / y: start position in % of the section, width: size in px at a 1400px wide screen,
  rotation: in degrees. Objects are pushed away by the cursor and tilt a little.
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

        // Mutable per-frame state lives outside React state → no re-renders at 60 fps
        // On narrow (portrait) screens the objects are spread over the full height,
        // otherwise they would all pile up in the upper middle.
        const narrow = container.clientWidth < 640;
        const pos = ITEMS.map((it) => ({ x: it.x, y: narrow ? 8 + (it.y - 20) * 2.6 : it.y, tilt: 0 }));
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
                    p.x -= ((Math.cos(angle) * force * 8) / box.width) * 100;
                    p.y -= ((Math.sin(angle) * force * 8) / box.height) * 100;
                    p.tilt += (force * 15 - p.tilt) * 0.2;
                } else {
                    p.tilt *= 0.9; // ease back
                }

                // Keep at least ~1/3 of every object inside the section
                p.x = Math.max(-(r.width * 0.4 / box.width) * 100, Math.min(100 - (r.width * 0.6 / box.width) * 100, p.x));
                p.y = Math.max(-(r.height * 0.4 / box.height) * 100, Math.min(100 - (r.height * 0.6 / box.height) * 100, p.y));

                el.style.left = `${p.x}%`;
                el.style.top = `${p.y}%`;
                el.style.setProperty("--tilt", `${p.tilt}deg`);
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
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={it.src} alt="" draggable={false} />
                </div>
            ))}
        </div>
    );
};

export default DeskItems;
