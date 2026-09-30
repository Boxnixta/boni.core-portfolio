"use client";

import { useState } from "react";
import Lightbox, { isVideo } from "./Lightbox";

/*
  Fixed layouts for Readymag-style rows (Event Design).

  mode "grid" (default): tiles on a 3-column grid, centred.
     span: 3 → full width (e.g. a banner). 2 stories → centred, each one third wide.
  mode "row": all tiles side by side with the SAME height (widths follow ratio = width / height).
     plain: true → no card look (for cut-out PNGs like the hand with the phone).

  className on the row, e.g. "bleed-right" → the row runs to the right edge of the window.
  Click → lightbox.
*/
export type RowItem = { src: string; alt?: string; ratio?: number; span?: 1 | 2 | 3; plain?: boolean };

/* eslint-disable @next/next/no-img-element */
const MediaRow = ({ items, mode = "grid", className = "" }: { items: RowItem[]; mode?: "grid" | "row"; className?: string }) => {
    const [open, setOpen] = useState<number | null>(null);

    return (
        <>
            <div className={`media-row not-prose is-${mode} ${className}`}>
                {items.map((it, i) => (
                    <button
                        key={it.src}
                        type="button"
                        className={`media-tile ${it.plain ? "is-plain" : ""} ${it.span ? `span-${it.span}` : ""}`}
                        style={mode === "row" && it.ratio ? { flex: `${it.ratio} 1 0%`, aspectRatio: `${it.ratio}` } : undefined}
                        onClick={() => setOpen(i)}
                        aria-label={`Open ${it.alt || "media"} in large view`}
                    >
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

export default MediaRow;
