"use client";

import { useRef, useState } from "react";

/*
  Skill folders that can be dragged into the shopping basket.
  A folder lands exactly where it is dropped. Dropped over the basket = "in the basket"
  (same size, stays ON TOP of the basket).
  While a folder is held, a thin pulsing pink line leads from it into the basket.
  A mouse click alone does nothing (no jumping around). Keyboard: Tab to a folder,
  Enter / Space puts it into the basket or takes it out again.
  After a drag the position is stored in % of the playground, so it survives resizing.
*/
type Folder = { id: string; label: string; x: number; row: number; y?: number; inCart: boolean };

// 3 rows of 3; x in % of the playground, row in folder rows (small offsets = hand-placed look)
const START: Folder[] = [
    { id: "creative-tech", label: "Creative Technologist",            x: 0,  row: 0,    inCart: false },
    { id: "3d",            label: "3D Generalist",                    x: 35, row: 0.08, inCart: false },
    { id: "xr",            label: "XR, Real-time & Projection",       x: 70, row: 0,    inCart: false },
    { id: "coding",        label: "Creative Coding & Generative Art", x: 10, row: 1,    inCart: false },
    { id: "physical",      label: "Interaction Design",               x: 45, row: 0.98, inCart: false },
    { id: "sound",         label: "Sound Design",                     x: 74, row: 1,    inCart: false },
    { id: "film",          label: "Motion Design, VFX",               x: 2,  row: 2.04, inCart: false },
    { id: "graphic",       label: "Graphic Design & Branding",        x: 33, row: 2.1,  inCart: false },
    { id: "illustration",  label: "Illustration",                     x: 70, row: 2.08, inCart: false },
];

/* ---- coloured papers inside each folder: 2-4 sheets, colours picked at random per folder.
   Seeded by the folder id, so server and browser render the same thing (no hydration flicker). */
const PAPER_COLOURS = ["#ff98e0", "#ffe36e", "#7ee8c4", "#ffad5c", "#b9a4ff", "#ff7a8a", "#c6f36b", "#8fd3ff", "#ffffff"];

const seeded = (str: string) => {
    let h = 2166136261;
    for (let i = 0; i < str.length; i++) h = Math.imul(h ^ str.charCodeAt(i), 16777619);
    return () => {
        h = Math.imul(h ^ (h >>> 15), 2246822507) ^ Math.imul(h ^ (h >>> 13), 3266489909);
        return ((h ^= h >>> 16) >>> 0) / 4294967296;
    };
};

const papersFor = (id: string) => {
    const rnd = seeded(id);
    const pool = [...PAPER_COLOURS];
    const count = 2 + Math.floor(rnd() * 3); // 2, 3 or 4
    return Array.from({ length: count }, (_, i) => ({
        colour: pool.splice(Math.floor(rnd() * pool.length), 1)[0],
        rot: (rnd() - 0.5) * 10, // deg
        shift: (rnd() - 0.5) * 8, // % sideways
        i,
        count,
    }));
};
const PAPERS = Object.fromEntries(START.map((f) => [f.id, papersFor(f.id)]));

/* macOS-style folder built from shapes: back with tab, coloured papers, and a front flap
   that tips open on hover. Sizes are in cqw of the folder, so it stays crisp at any size. */
const FolderIcon = ({ id, label }: { id: string; label: string }) => (
    <>
        <span className="folder-icon" aria-hidden="true">
            <svg className="folder-back" viewBox="0 0 100 76" preserveAspectRatio="none">
                <path d="M0 9 Q0 0 9 0 H31 Q35 0 38 3 L42 7 Q44 9 48 9 H91 Q100 9 100 18 V67 Q100 76 91 76 H9 Q0 76 0 67 Z" />
            </svg>
            {PAPERS[id].map((p) => (
                <span
                    key={p.i}
                    className="folder-paper"
                    style={
                        {
                            background: p.colour,
                            "--paper-rot": `${p.rot}deg`,
                            "--paper-shift": `${p.shift}%`,
                            // back sheets stick out further when the folder opens
                            "--paper-lift": `${-26 + (p.i / Math.max(1, p.count - 1)) * 14}%`,
                        } as React.CSSProperties
                    }
                />
            ))}
            <span className="folder-front" />
        </span>
        <span className="folder-label">{label}</span>
    </>
);

const randomSpot = () => [0.2 + Math.random() * 0.5, 0.2 + Math.random() * 0.4];

const FolderPlayground = () => {
    const [folders, setFolders] = useState(START);
    const areaRef = useRef<HTMLDivElement>(null);
    const basketRef = useRef<HTMLImageElement>(null);
    const guideRef = useRef<SVGSVGElement>(null);
    const drag = useRef<{ id: string; startX: number; startY: number; moved: boolean; el: HTMLElement } | null>(null);

    const inCartCount = folders.filter((f) => f.inCart).length;

    const isOverBasket = (x: number, y: number) => {
        const b = basketRef.current!.getBoundingClientRect();
        // inner 80% of the basket image counts, so the corners/whitespace don't
        return x > b.left + b.width * 0.1 && x < b.right - b.width * 0.1 && y > b.top + b.height * 0.1 && y < b.bottom - b.height * 0.1;
    };

    /* pink guide wire (like a TouchDesigner node connection): from the held folder into the basket */
    const updateGuide = (el: HTMLElement, pointerX: number, pointerY: number) => {
        const svg = guideRef.current;
        if (!svg || !areaRef.current || !basketRef.current) return;
        const a = areaRef.current.getBoundingClientRect();
        const f = el.getBoundingClientRect();
        const b = basketRef.current.getBoundingClientRect();
        const x1 = f.left + f.width / 2 - a.left;
        const y1 = f.top + f.height * 0.35 - a.top;
        const x2 = b.left + b.width * 0.5 - a.left;
        const y2 = b.top + b.height * 0.45 - a.top;
        // smooth S-shaped cable: leaves the folder straight down, enters the basket straight down
        const pull = Math.max(40, Math.abs(y2 - y1) * 0.55);
        const d = `M${x1},${y1} C${x1},${y1 + pull} ${x2},${y2 - pull} ${x2},${y2}`;
        svg.querySelectorAll("path").forEach((p) => p.setAttribute("d", d));
        const [start, end] = Array.from(svg.querySelectorAll("circle"));
        start.setAttribute("cx", `${x1}`);
        start.setAttribute("cy", `${y1}`);
        end.setAttribute("cx", `${x2}`);
        end.setAttribute("cy", `${y2}`);
        svg.classList.toggle("is-over", isOverBasket(pointerX, pointerY));
    };

    const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>, f: Folder) => {
        const el = e.currentTarget;
        el.setPointerCapture(e.pointerId); // keep receiving moves even outside the element
        drag.current = { id: f.id, startX: e.clientX, startY: e.clientY, moved: false, el };
        el.classList.add("is-dragging");
        updateGuide(el, e.clientX, e.clientY);
        guideRef.current?.classList.add("is-visible");
    };

    const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (Math.hypot(dx, dy) > 4) d.moved = true;
        // only CSS while dragging → no React re-render per frame
        d.el.style.translate = `${dx}px ${dy}px`;
        updateGuide(d.el, e.clientX, e.clientY);
    };

    const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
        const d = drag.current;
        guideRef.current?.classList.remove("is-visible", "is-over");
        if (!d) return;
        drag.current = null;
        const { el } = d;
        el.classList.remove("is-dragging");
        el.style.translate = "";
        if (!d.moved) return; // a plain click: stay put

        // New top-left = old position + drag distance, clamped to the playground
        const area = areaRef.current!.getBoundingClientRect();
        const x = Math.max(0, Math.min(area.width - el.offsetWidth, el.offsetLeft + (e.clientX - d.startX)));
        const y = Math.max(0, Math.min(area.height - el.offsetHeight, el.offsetTop + (e.clientY - d.startY)));
        const inCart = isOverBasket(e.clientX, e.clientY);

        setFolders((prev) =>
            prev.map((f) => (f.id === d.id ? { ...f, x: (x / area.width) * 100, y: (y / area.height) * 100, inCart } : f))
        );
    };

    // Keyboard only (Enter / Space → click with detail 0): toggle basket. Mouse clicks do nothing.
    const onClick = (e: React.MouseEvent<HTMLButtonElement>, f: Folder) => {
        if (e.detail !== 0) return;
        if (f.inCart) {
            setFolders((prev) => prev.map((x) => (x.id === f.id ? { ...START.find((s) => s.id === f.id)! } : x)));
            return;
        }
        const el = e.currentTarget;
        const area = areaRef.current!.getBoundingClientRect();
        const b = basketRef.current!.getBoundingClientRect();
        const w = el.offsetWidth;
        const [rx, ry] = randomSpot();
        const px = b.left - area.left + b.width * rx - w / 2;
        const py = b.top - area.top + b.height * ry - w / 2;
        setFolders((prev) =>
            prev.map((x) => (x.id === f.id ? { ...x, x: (px / area.width) * 100, y: (py / area.height) * 100, inCart: true } : x))
        );
    };

    return (
        <div ref={areaRef} className="folder-playground">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={basketRef} src="/img/about/Einkaufswagen.png" alt="Shopping basket" className="basket" draggable={false} />

            <svg ref={guideRef} className="basket-guide" aria-hidden="true">
                <path className="basket-guide-wire" />
                <path className="basket-guide-flow" />
                <circle className="basket-guide-port" r="3" />
                <circle className="basket-guide-port is-end" r="3.5" />
            </svg>

            {folders.map((f) => (
                <button
                    key={f.id}
                    type="button"
                    className={`folder ${f.inCart ? "in-cart" : ""}`}
                    style={{ left: `${f.x}%`, top: f.y === undefined ? `calc(${f.row} * var(--folder-pitch))` : `${f.y}%` }}
                    onPointerDown={(e) => onPointerDown(e, f)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onClick={(e) => onClick(e, f)}
                    aria-pressed={f.inCart}
                    aria-label={`${f.label}${f.inCart ? " (in the basket, press to take out)" : ", drag or press to put into the basket"}`}
                >
                    <FolderIcon id={f.id} label={f.label} />
                </button>
            ))}

            <p className="basket-counter" aria-live="polite">
                {inCartCount === 0 && "drag my skills into the basket ↑"}
                {inCartCount > 0 && inCartCount < START.length && `${inCartCount}/${START.length} skills in the basket`}
                {inCartCount === START.length && "all skills in the basket ♡ let's work together!"}
            </p>
        </div>
    );
};

export default FolderPlayground;
