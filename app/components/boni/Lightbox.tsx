"use client";

import { useCallback, useEffect } from "react";

/*
  Shared large view for Collage and MediaRow: arrows, ← → keys, Esc, click outside closes.
*/
export type LightboxItem = { src: string; alt?: string };

export const isVideo = (src: string) => /\.(mp4|mov|webm)$/i.test(src);

/* eslint-disable @next/next/no-img-element */
const Lightbox = ({ items, open, setOpen }: { items: LightboxItem[]; open: number | null; setOpen: (fn: (i: number | null) => number | null) => void }) => {
    const prev = useCallback(() => setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length)), [items.length, setOpen]);
    const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % items.length)), [items.length, setOpen]);

    useEffect(() => {
        if (open === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(() => null);
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden"; // no page scrolling behind the lightbox
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, prev, next, setOpen]);

    if (open === null) return null;
    const it = items[open];

    return (
        <div className="lightbox" role="dialog" aria-modal="true" aria-label="Large view" onClick={() => setOpen(() => null)}>
            <div className="lightbox-media" onClick={(e) => e.stopPropagation()}>
                {isVideo(it.src) ? (
                    <video key={it.src} src={it.src} autoPlay controls loop playsInline />
                ) : (
                    <img src={it.src} alt={it.alt ?? ""} />
                )}
                {it.alt && <p className="lightbox-caption">{it.alt}</p>}
            </div>
            {items.length > 1 && (
                <>
                    <button type="button" className="lightbox-btn left-3 sm:left-6" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
                    <button type="button" className="lightbox-btn right-3 sm:right-6" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
                    <p className="lightbox-count">{open + 1} / {items.length}</p>
                </>
            )}
            <button type="button" className="lightbox-close" onClick={() => setOpen(() => null)} aria-label="Close" autoFocus>×</button>
        </div>
    );
};

export default Lightbox;
