"use client";

import { useRef } from "react";

/*
  Thumbnail video.
  hoverOnly = false: plays muted in a loop all the time.
  hoverOnly = true:  the still image stays visible, the film only fades in and plays while hovering.
*/
const HoverVideo = ({
    src,
    poster,
    label,
    hoverOnly = false,
    className = "",
    style,
}: {
    src: string;
    poster: string;
    label: string;
    hoverOnly?: boolean;
    className?: string;
    style?: React.CSSProperties;
}) => {
    const ref = useRef<HTMLVideoElement>(null);

    if (!hoverOnly) {
        return (
            <video src={src} poster={poster} autoPlay muted loop playsInline preload="metadata" aria-label={label} className={className} style={style} />
        );
    }

    return (
        <video
            ref={ref}
            src={src}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden="true"
            className={`thumb-hover-video ${className}`}
            style={style}
            onMouseEnter={() => { ref.current?.play().catch(() => {}); }}
            onMouseLeave={() => { if (ref.current) { ref.current.pause(); ref.current.currentTime = 0; } }}
        />
    );
};

export default HoverVideo;
