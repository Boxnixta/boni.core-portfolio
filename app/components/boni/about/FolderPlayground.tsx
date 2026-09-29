"use client";

import { useRef, useState } from "react";

/*
  Skill folders that can be dragged into the shopping basket.
  A folder lands exactly where it is dropped. Dropped over the basket = "in the basket":
  it shrinks a little and stays ON TOP of the basket.
  Positions are stored in % of the playground, so they survive resizing.
  Keyboard: Tab to a folder, Enter / Space puts it into the basket or takes it out.
*/
type Folder = { id: string; label: string; src: string; x: number; y: number; inCart: boolean };

const START: Folder[] = [
    { id: "animation",    label: "Animation",              src: "/img/about/Ordner-Icon_Animation.png",           x: 20, y: 0,  inCart: false },
    { id: "grafik",       label: "Graphic Design",         src: "/img/about/Ordner-Icon_Grafik-Design.png",       x: 2,  y: 16, inCart: false },
    { id: "3d",           label: "3D Design",              src: "/img/about/Ordner-Icon_3D-Design.png",           x: 26, y: 12, inCart: false },
    { id: "film",         label: "Film & Post-production", src: "/img/about/Ordner-Icon_Film-Postproduction.png", x: 50, y: 8,  inCart: false },
    { id: "illustration", label: "Illustration",           src: "/img/about/Ordner-Icon_Illustration.png",        x: 74, y: 14, inCart: false },
    { id: "sound",        label: "Sound Design",           src: "/img/about/Ordner-Icon_Sounddesign.png",         x: 76, y: 40, inCart: false },
];

const FolderPlayground = () => {
    const [folders, setFolders] = useState(START);
    const areaRef = useRef<HTMLDivElement>(null);
    const basketRef = useRef<HTMLImageElement>(null);
    const drag = useRef<{ id: string; startX: number; startY: number; moved: boolean; el: HTMLElement } | null>(null);

    const inCartCount = folders.filter((f) => f.inCart).length;

    const isOverBasket = (x: number, y: number) => {
        const b = basketRef.current!.getBoundingClientRect();
        // inner 80% of the basket image counts, so the corners/whitespace don't
        return x > b.left + b.width * 0.1 && x < b.right - b.width * 0.1 && y > b.top + b.height * 0.1 && y < b.bottom - b.height * 0.1;
    };

    const onPointerDown = (e: React.PointerEvent<HTMLButtonElement>, f: Folder) => {
        const el = e.currentTarget;
        el.setPointerCapture(e.pointerId); // keep receiving moves even outside the element
        drag.current = { id: f.id, startX: e.clientX, startY: e.clientY, moved: false, el };
        el.classList.add("is-dragging");
    };

    const onPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
        const d = drag.current;
        if (!d) return;
        const dx = e.clientX - d.startX;
        const dy = e.clientY - d.startY;
        if (Math.hypot(dx, dy) > 4) d.moved = true;
        // only CSS while dragging → no React re-render per frame
        d.el.style.translate = `${dx}px ${dy}px`;
    };

    const onPointerUp = (e: React.PointerEvent<HTMLButtonElement>) => {
        const d = drag.current;
        if (!d) return;
        drag.current = null;
        const { el } = d;
        el.classList.remove("is-dragging");
        if (!d.moved) {
            el.style.translate = "";
            return; // a click → handled by onClick
        }

        // New top-left = old position + drag distance, clamped to the playground
        const area = areaRef.current!.getBoundingClientRect();
        el.style.translate = "";
        const x = Math.max(0, Math.min(area.width - el.offsetWidth, el.offsetLeft + (e.clientX - d.startX)));
        const y = Math.max(0, Math.min(area.height - el.offsetHeight, el.offsetTop + (e.clientY - d.startY)));
        const inCart = isOverBasket(e.clientX, e.clientY);

        setFolders((prev) =>
            prev.map((f) => (f.id === d.id ? { ...f, x: (x / area.width) * 100, y: (y / area.height) * 100, inCart } : f))
        );
        el.dataset.dragged = "1"; // swallow the click that follows a drag
    };

    // Keyboard / click: toggle — into the basket at a random spot, or back to the start
    const onClick = (e: React.MouseEvent<HTMLButtonElement>, f: Folder) => {
        const el = e.currentTarget;
        if (el.dataset.dragged) {
            delete el.dataset.dragged;
            return;
        }
        if (f.inCart) {
            setFolders((prev) => prev.map((x) => (x.id === f.id ? { ...START.find((s) => s.id === f.id)! } : x)));
            return;
        }
        const area = areaRef.current!.getBoundingClientRect();
        const b = basketRef.current!.getBoundingClientRect();
        const w = el.offsetWidth;
        const px = b.left - area.left + b.width * (0.2 + Math.random() * 0.5) - w / 2;
        const py = b.top - area.top + b.height * (0.2 + Math.random() * 0.4) - w / 2;
        setFolders((prev) =>
            prev.map((x) => (x.id === f.id ? { ...x, x: (px / area.width) * 100, y: (py / area.height) * 100, inCart: true } : x))
        );
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
                    aria-label={`${f.label}${f.inCart ? " (in the basket, press to take out)" : ", drag or press to put into the basket"}`}
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
