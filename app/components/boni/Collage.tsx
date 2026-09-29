"use client";

import { useCallback, useEffect, useState } from "react";

/*
  Masonry collage for many images and videos (like the Readymag / PDF layouts).
  Click any tile → lightbox with arrows, ← → keys and Esc.
  Use it inside a project .mdx:
    import Collage from '@/app/components/boni/Collage';
    <Collage items={[{ src: "/img/…/a.png", alt: "…" }, { src: "/img/…/b.mp4" }]} />
  Files ending in .mp4 / .mov / .webm are shown as muted looping videos.
*/
export type CollageItem = { src: string; alt?: string };

const isVideo = (src: string) => /\.(mp4|mov|webm)$/i.test(src);

/* eslint-disable @next/next/no-img-element */
const Collage = ({ items, columns = 3 }: { items: CollageItem[]; columns?: 2 | 3 | 4 }) => {
    const [open, setOpen] = useState<number | null>(null);

    const prev = useCallback(() => setOpen((i) => (i === null ? i : (i - 1 + items.length) % items.length)), [items.length]);
    const next = useCallback(() => setOpen((i) => (i === null ? i : (i + 1) % items.length)), [items.length]);

    useEffect(() => {
        if (open === null) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === "Escape") setOpen(null);
            if (e.key === "ArrowLeft") prev();
            if (e.key === "ArrowRight") next();
        };
        document.addEventListener("keydown", onKey);
        document.body.style.overflow = "hidden"; // no page scrolling behind the lightbox
        return () => {
            document.removeEventListener("keydown", onKey);
            document.body.style.overflow = "";
        };
    }, [open, prev, next]);

    const colClass = { 2: "sm:columns-2", 3: "sm:columns-2 lg:columns-3", 4: "sm:columns-3 lg:columns-4" }[columns];

    return (
        <>
            <div className={`collage not-prose columns-1 ${colClass}`}>
                {items.map((it, i) => (
                    <button key={it.src} type="button" className="collage-tile" onClick={() => setOpen(i)} aria-label={`Open ${it.alt || "media"} in large view`}>
                        {isVideo(it.src) ? (
                            <video src={it.src} autoPlay muted loop playsInline preload="metadata" />
                        ) : (
                            <img src={it.src} alt={it.alt ?? ""} loading="lazy" />
                        )}
                    </button>
                ))}
            </div>

            {open !== null && (
                <div className="lightbox" role="dialog" aria-modal="true" aria-label="Large view" onClick={() => setOpen(null)}>
                    <div className="lightbox-media" onClick={(e) => e.stopPropagation()}>
                        {isVideo(items[open].src) ? (
                            <video key={items[open].src} src={items[open].src} autoPlay controls loop playsInline />
                        ) : (
                            <img src={items[open].src} alt={items[open].alt ?? ""} />
                        )}
                        {items[open].alt && <p className="lightbox-caption">{items[open].alt}</p>}
                    </div>
                    <button type="button" className="lightbox-btn left-3 sm:left-6" onClick={(e) => { e.stopPropagation(); prev(); }} aria-label="Previous">‹</button>
                    <button type="button" className="lightbox-btn right-3 sm:right-6" onClick={(e) => { e.stopPropagation(); next(); }} aria-label="Next">›</button>
                    <button type="button" className="lightbox-close" onClick={() => setOpen(null)} aria-label="Close" autoFocus>×</button>
                    <p className="lightbox-count">{open + 1} / {items.length}</p>
                </div>
            )}
        </>
    );
};

export default Collage;
