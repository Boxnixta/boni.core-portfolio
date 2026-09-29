"use client";

import { useRef, useState } from "react";

/*
  Skill folders that can be dragged into the shopping basket.
  Positions are stored in % of the playground, so the layout survives resizing.
  Works with mouse and touch (pointer events). Keyboard: Tab to a folder,
  Enter / Space puts it into the basket or takes it out again.
*/
type Folder = { id: string; label: string; src: string; x: number; y: number; inCart: boolean; slot?: number };

const START: Folder[] = [
    { id: "animation",   label: "Animation",              src: "/img/about/Ordner-Icon_Animation.png",          x: 20, y: 0,  inCart: false },
    { id: "grafik",      label: "Graphic Design",         src: "/img/about/Ordner-Icon_Grafik-Design.png",      x: 2,  y: 16, inCart: false },
    { id: "3d",          label: "3D Design",              src: "/img/about/Ordner-Icon_3D-Design.png",          x: 26, y: 12, inCart: false },
    { id: "film",        label: "Film & Post-production", src: "/img/about/Ordner-Icon_Film-Postproduction.png", x: 50, y: 8,  inCart: false },
    { id: "illustration",label: "Illustration",           src: "/img/about/Ordner-Icon_Illustration.png",       x: 74, y: 14, inCart: false },
    { id: "sound",       label: "Sound Design",           src: "/img/about/Ordner-Icon_Sounddesign.png",        x: 76, y: 40, inCart: false },
];

// Where folders land inside the basket (in % of the basket box): 3 × 2 grid
const SLOTS = [
    { x: 0.2, y: 0.28 }, { x: 0.45, y: 0.22 }, { x: 0.7, y: 0.28 },
    { x: 0.25, y: 0.55 }, { x: 0.5, y: 0.5 },  { x: 0.72, y: 0.58 },
];

const FolderPlayground = () => {
    const [folders, setFolders] = useState(START);
    const areaRef = useRef<HTMLDivElement>(null);
    const basketRef = useRef<HTMLImageElement>(null);
    const drag = useRef<{ id: string; startX: number; startY: number; moved: boolean; el: HTMLElement } | null>(null);

    const inCartCount = folders.filter((f) => f.inCart).length;

    // Convert a basket slot to playground % (top-left corner of the folder)
    const slotPosition = (slotIndex: number, folderEl: HTMLElement) => {
        const area = areaRef.current!.getBoundingClientRect();
        const b = basketRef.current!.getBoundingClientRect();
        const s = SLOTS[slotIndex % SLOTS.length];
        const w = folderEl.offsetWidth * 0.7; // folders shrink in the basket
        const cx = b.left + b.width * s.x - area.left - w / 2;
        const cy = b.top + b.height * s.y - area.top - w / 2;
        return { x: (cx / area.width) * 100, y: (cy / area.height) * 100 };
    };

    const putIntoCart = (id: string, el: HTMLElement) =>
        setFolders((prev) => {
            // first free slot, so folders never land on top of each other
            const used = prev.filter((f) => f.inCart && f.id !== id).map((f) => f.slot);
            const slot = SLOTS.findIndex((_, i) => !used.includes(i));
            const p = slotPosition(slot, el);
            return prev.map((f) => (f.id === id ? { ...f, ...p, inCart: true, slot } : f));
        });

    const takeOut = (id: string) =>
        setFolders((prev) => prev.map((f) => (f.id === id ? { ...START.find((s) => s.id === id)! } : f)));

    const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>, f: Folder) => {
        const el = e.currentTarget;
        el.setPointerCapture(e.pointerId); // keep receiving moves even outside the element
        drag.current = { id: f.id, startX: e.clientX, startY: e.clientY, moved: false, el };
        el.style.transition = "none";
        el.style.zIndex = "30";
    };

    const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (Math.hypot(dx, dy) > 4) d.moved = true;
        // Move with CSS transform only while dragging (no re-render per frame)
        d.el.style.transform = `translate(${dx}px, ${dy}px) rotate(${dx * 0.05}deg) scale(1.08)`;
    };

    const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
        const d = drag.current;
        if (!d) return;
        drag.current = null;
        const { el } = d;
        el.style.transition = "";
        el.style.transform = "";
        el.style.zIndex = "";
        if (!d.moved) return; // it was a click → handled by onClick

        const area = areaRef.current!.getBoundingClientRect();
        const b = basketRef.current!.getBoundingClientRect();
        const overBasket = e.clientX > b.left && e.clientX < b.right && e.clientY > b.top && e.clientY < b.bottom;

        if (overBasket) {
            putIntoCart(d.id, el);
        } else {
            // Drop where released, clamped inside the playground
            const r = el.getBoundingClientRect();
            const dx = e.clientX - d.startX;
            const dy = e.clientY - d.startY;
            const x = Math.max(0, Math.min(area.width - r.width, r.left - area.left + dx));
            const y = Math.max(0, Math.min(area.height - r.height, r.top - area.top + dy));
            setFolders((prev) =>
                prev.map((f) =>
                    f.id === d.id ? { ...f, x: (x / area.width) * 100, y: (y / area.height) * 100, inCart: false, slot: undefined } : f
                )
            );
        }
        // Swallow the click that follows a drag
        el.dataset.dragged = "1";
    };

    const onClick = (e: React.MouseEvent<HTMLButtonElement>, f: Folder) => {
        const el = e.currentTarget;
        if (el.dataset.dragged) {
            delete el.dataset.dragged;
            return;
        }
        if (f.inCart) takeOut(f.id);
        else putIntoCart(f.id, el);
    };

    return (
        <div ref={areaRef} className="folder-playground">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img ref={basketRef} src="/img/about/Einkaufswagen.png" alt="Shopping basket" className="basket" draggable={false} />

            {folders.map((f) => (
                <button
                    key={f.id}
                    type="button"
                    className={`folder ${f.inCart ? "in-cart" : ""}`}
                    style={{ left: `${f.x}%`, top: `${f.y}%` }}
                    onPointerDown={(e) => onPointerDown(e, f)}
                    onPointerMove={onPointerMove}
                    onPointerUp={onPointerUp}
                    onPointerCancel={onPointerUp}
                    onClick={(e) => onClick(e, f)}
                    aria-pressed={f.inCart}
                    aria-label={`${f.label}${f.inCart ? " (in the basket – press to take out)" : " – drag or press to put into the basket"}`}
                >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={f.src} alt="" draggable={false} />
                </button>
            ))}

            <p className="basket-counter" aria-live="polite">
                {inCartCount === 0 && "drag my skills into the basket ↓"}
                {inCartCount > 0 && inCartCount < START.length && `${inCartCount}/${START.length} skills in the basket`}
                {inCartCount === START.length && "all skills in the basket ♡ let's work together!"}
            </p>
        </div>
    );
};

export default FolderPlayground;
