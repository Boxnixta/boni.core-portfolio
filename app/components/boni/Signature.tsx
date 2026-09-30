"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";

/*
  Hand-drawn signature, fixed bottom left, wiggles on hover, links to the contact page. Hidden on small screens.
  It sits low in the corner. When the footer scrolls into view, it is lifted
  by exactly the visible footer height, so it never covers the footer.
*/
const GAP = 16; // px between signature and window bottom / footer

const Signature = () => {
    const ref = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
        const footer = document.querySelector("footer");
        const update = () => {
            if (!ref.current) return;
            const overlap = footer ? Math.max(0, window.innerHeight - footer.getBoundingClientRect().top) : 0;
            ref.current.style.bottom = `${GAP + overlap}px`;
        };
        update();
        window.addEventListener("scroll", update, { passive: true });
        window.addEventListener("resize", update);
        return () => {
            window.removeEventListener("scroll", update);
            window.removeEventListener("resize", update);
        };
    }, []);

    return (
        <Link ref={ref} href="/contact" className="signature" aria-label="Contact Bonita von Gizycki">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/brand/signature.webp" alt="" />
        </Link>
    );
};

export default Signature;
