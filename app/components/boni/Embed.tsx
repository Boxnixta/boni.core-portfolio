"use client";

import { useState } from "react";

/*
  Embeds a live web app or video (iframe) in a project page.
  It only loads after a click: the page stays fast, and scrolling the page
  never gets "caught" inside the 3D scene by accident.
  Usage in .mdx:
    import Embed from '@/app/components/boni/Embed';
    <Embed src="https://…" title="Live demo" poster="/img/…/thumb.jpg" />
*/
const Embed = ({
    src,
    title,
    poster,
    ratio = "16 / 9",
    label = "Start live demo",
}: {
    src: string;
    title: string;
    poster?: string;
    ratio?: string;
    label?: string;
}) => {
    const [active, setActive] = useState(false);

    return (
        <div className="embed not-prose" style={{ aspectRatio: ratio }}>
            {active ? (
                <iframe
                    src={src}
                    title={title}
                    allow="autoplay; fullscreen; xr-spatial-tracking; accelerometer; gyroscope"
                    allowFullScreen
                    loading="lazy"
                />
            ) : (
                <button type="button" className="embed-start" onClick={() => setActive(true)}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    {poster && <img src={poster} alt="" />}
                    <span className="btn-glow">▶ {label}</span>
                </button>
            )}
        </div>
    );
};

export default Embed;
