"use client";

import { useCallback, useState } from "react";

/*
  Page-by-page viewer for comics, slide decks and booklets.
  Click the page or use the arrows / ← → keys (when focused) to turn pages.
*/
/* eslint-disable @next/next/no-img-element */
const Flipbook = ({ pages, label = "Pages", ratio }: { pages: string[]; label?: string; ratio?: string }) => {
    const [i, setI] = useState(0);
    const prev = useCallback(() => setI((v) => (v - 1 + pages.length) % pages.length), [pages.length]);
    const next = useCallback(() => setI((v) => (v + 1) % pages.length), [pages.length]);

    return (
        <div
            className="flipbook not-prose"
            tabIndex={0}
            role="group"
            aria-roledescription="page viewer"
            aria-label={label}
            onKeyDown={(e) => {
                if (e.key === "ArrowLeft") prev();
                if (e.key === "ArrowRight") next();
            }}
        >
            <button type="button" className="flipbook-page" onClick={next} aria-label="Next page" style={ratio ? { aspectRatio: ratio } : undefined}>
                <img src={pages[i]} alt={`${label}, page ${i + 1} of ${pages.length}`} />
            </button>
            <div className="flipbook-bar">
                <button type="button" className="btn filter-pill" onClick={prev} aria-label="Previous page">‹</button>
                <span className="flipbook-count" aria-live="polite">{i + 1} / {pages.length}</span>
                <button type="button" className="btn filter-pill" onClick={next} aria-label="Next page">›</button>
            </div>
            {/* preload the next page so turning feels instant */}
            <link rel="preload" as="image" href={pages[(i + 1) % pages.length]} />
        </div>
    );
};

export default Flipbook;
