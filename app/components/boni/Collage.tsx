"use client";

import { useState } from "react";
import Lightbox, { isVideo, type LightboxItem } from "./Lightbox";

/*
  Masonry collage for many images and videos (like the Readymag / PDF layouts).
  Click any tile → lightbox with arrows, ← → keys and Esc.
    <Collage items={[{ src: "/img/…/a.png", alt: "…" }, { src: "/img/…/b.mp4" }]} />
  columns = 2 | 3 | 4, plain = no card look (no rounded corners, no shadow).
  Files ending in .mp4 / .mov / .webm are shown as muted looping videos.
*/
export type CollageItem = LightboxItem;

/* eslint-disable @next/next/no-img-element */
const Collage = ({ items, columns = 3, plain = false }: { items: CollageItem[]; columns?: 2 | 3 | 4; plain?: boolean }) => {
    const [open, setOpen] = useState<number | null>(null);
    const colClass = { 2: "sm:columns-2", 3: "sm:columns-2 lg:columns-3", 4: "sm:columns-3 lg:columns-4" }[columns];

    return (
        <>
            <div className={`collage not-prose columns-1 ${colClass} ${plain ? "is-plain" : ""}`}>
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
            <Lightbox items={items} open={open} setOpen={setOpen} />
        </>
    );
};

export default Collage;
