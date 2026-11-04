"use client";

import { useEffect, useRef } from "react";

/*
  Wrap any decorative image to make it grabbable (mouse + touch).
  The element stays where it is dropped: the offset is kept in a ref and
  applied as a CSS transform, so the layout around it never changes.

  Grabbing follows the visible pixels, not the rectangle: a press on a
  transparent part of an image falls through to the draggable underneath.
  First the exact pixel is checked for every draggable under the pointer
  (top to bottom), then the same again with a small radius, so thin
  shapes (stars, outlines) are still easy to catch.
*/

const ALPHA_MIN = 24; // 0-255: what counts as "solid"
const GRAB_RADIUS = 8; // px around the pointer for the second pass

type AlphaMap = { w: number; h: number; data: Uint8ClampedArray };
const alphaCache = new Map<string, AlphaMap | "loading" | "error">();

const loadAlpha = (src: string) => {
    if (alphaCache.has(src)) return;
    alphaCache.set(src, "loading");
    const img = new Image();
    img.onload = () => {
        try {
            // sample at most ~400px wide, plenty for hit testing
            const k = Math.min(1, 400 / img.naturalWidth);
            const w = Math.max(1, Math.round(img.naturalWidth * k));
            const h = Math.max(1, Math.round(img.naturalHeight * k));
            const canvas = document.createElement("canvas");
            canvas.width = w;
            canvas.height = h;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            if (!ctx) throw new Error("no 2d context");
            ctx.drawImage(img, 0, 0, w, h);
            alphaCache.set(src, { w, h, data: ctx.getImageData(0, 0, w, h).data });
        } catch {
            alphaCache.set(src, "error");
        }
    };
    img.onerror = () => alphaCache.set(src, "error");
    img.src = src;
};

/* rotation + scale between `el` and the draggable root (CSS transform, rotate and scale) */
const accumulatedTransform = (el: HTMLElement, root: HTMLElement) => {
    let angle = 0;
    let scale = 1;
    for (let node: HTMLElement | null = el; node; node = node.parentElement) {
        const cs = getComputedStyle(node);
        if (cs.transform && cs.transform !== "none") {
            const m = new DOMMatrixReadOnly(cs.transform);
            angle += Math.atan2(m.b, m.a);
            scale *= Math.hypot(m.a, m.b);
        }
        if (cs.rotate && cs.rotate !== "none") {
            const deg = parseFloat(cs.rotate.split(" ").pop() || "0");
            if (!Number.isNaN(deg)) angle += (deg * Math.PI) / 180;
        }
        if (cs.scale && cs.scale !== "none") {
            const s = parseFloat(cs.scale);
            if (!Number.isNaN(s)) scale *= s;
        }
        if (node === root) break;
    }
    return { angle, scale };
};

/* alpha (0-255) of `box` showing `src` at viewport point x/y, or null if unknown */
const alphaAt = (box: HTMLElement, src: string, root: HTMLElement, x: number, y: number): number | null => {
    const map = alphaCache.get(src);
    if (!map || map === "loading" || map === "error") return null;
    const rect = box.getBoundingClientRect();
    const { angle, scale } = accumulatedTransform(box, root);
    const w = box.offsetWidth * scale;
    const h = box.offsetHeight * scale;
    if (!w || !h) return 0;
    // undo rotation around the box centre, then go to image pixels
    const dx = x - (rect.left + rect.width / 2);
    const dy = y - (rect.top + rect.height / 2);
    const cos = Math.cos(-angle);
    const sin = Math.sin(-angle);
    const lx = (dx * cos - dy * sin) / w + 0.5;
    const ly = (dx * sin + dy * cos) / h + 0.5;
    if (lx < 0 || lx >= 1 || ly < 0 || ly >= 1) return 0;
    return map.data[(Math.floor(ly * map.h) * map.w + Math.floor(lx * map.w)) * 4 + 3];
};

/* the images that define where a draggable is "solid" */
const hitLayers = (root: HTMLElement): { box: HTMLElement; src: string }[] => {
    const mask = root.dataset.hitMask;
    if (mask) return [{ box: root, src: mask }];
    return Array.from(root.querySelectorAll("img")).map((img) => ({ box: img, src: img.currentSrc || img.src }));
};

const isSolidAt = (root: HTMLElement, x: number, y: number, radius: number) => {
    const layers = hitLayers(root);
    if (!layers.length) return true;
    const points: [number, number][] = [[x, y]];
    if (radius > 0) {
        for (let r = radius / 2; r <= radius; r += radius / 2)
            for (let a = 0; a < 8; a++) points.push([x + r * Math.cos((a * Math.PI) / 4), y + r * Math.sin((a * Math.PI) / 4)]);
    }
    for (const { box, src } of layers) {
        for (const [px, py] of points) {
            const a = alphaAt(box, src, root, px, py);
            if (a === null) return true; // image not sampled (yet): behave like a plain rectangle
            if (a >= ALPHA_MIN) return true;
        }
    }
    return false;
};

/* each draggable keeps its own "start dragging" function on its element; a global symbol
   (not a module-level map) so it survives hot reloads during development */
type Starter = (e: React.PointerEvent<HTMLDivElement>) => void;
const STARTER = Symbol.for("boni.draggable.start");
const starterOf = (el: Element) => (el as Element & { [STARTER]?: Starter })[STARTER];

/* topmost draggable under the pointer whose visible pixels are hit */
const pickTarget = (x: number, y: number) => {
    const stack = document.elementsFromPoint(x, y).filter((el): el is HTMLElement => !!starterOf(el));
    return (
        stack.find((el) => isSolidAt(el, x, y, 0)) ?? stack.find((el) => isSolidAt(el, x, y, GRAB_RADIUS)) ?? null
    );
};

/* lift + tilt while held: the grabbed side comes up towards you, fast moves make it sway */
const LIFT_SCALE = 1.06;
const GRAB_TILT = 9; // deg, at the very edge of the object
const SWAY_MAX = 14; // deg
const SWAY_PER_PX = 0.9; // deg of sway per px/frame of horizontal speed

const Draggable = ({
    children,
    className = "",
    decorative = true,
    hitMask,
}: {
    children: React.ReactNode;
    className?: string;
    /* false keeps the children (e.g. an img with alt text) visible to screen readers */
    decorative?: boolean;
    /* image whose alpha defines the grab area across the whole box (default: the img children) */
    hitMask?: string;
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const offset = useRef({ x: 0, y: 0 });
    const start = useRef<{ x: number; y: number } | null>(null);
    // tilt state, animated in a rAF loop while held
    const tilt = useRef({ gx: 0, gy: 0, lift: 0, swayX: 0, swayY: 0, px: 0, py: 0, lastX: 0, lastY: 0, frame: 0 });

    const tiltLoop = () => {
        const el = ref.current;
        const t = tilt.current;
        if (!el || !start.current) return;
        // speed since last frame -> sway target, eased so it settles when the pointer rests
        const vx = t.px - t.lastX;
        const vy = t.py - t.lastY;
        t.lastX = t.px;
        t.lastY = t.py;
        const clamp = (v: number) => Math.max(-SWAY_MAX, Math.min(SWAY_MAX, v));
        t.swayX += (clamp(vx * SWAY_PER_PX) - t.swayX) * 0.18;
        t.swayY += (clamp(vy * SWAY_PER_PX) - t.swayY) * 0.18;
        t.lift += (1 - t.lift) * 0.2;
        const l = t.lift;
        el.style.transform =
            `perspective(700px) ` +
            `rotateX(${(t.gy * GRAB_TILT - t.swayY * 0.6) * l}deg) ` +
            `rotateY(${(-t.gx * GRAB_TILT + t.swayX * 0.6) * l}deg) ` +
            `rotateZ(${t.swayX * 0.5 * l}deg) ` +
            `scale(${1 + (LIFT_SCALE - 1) * l})`;
        t.frame = requestAnimationFrame(tiltLoop);
    };

    const startDrag = (e: React.PointerEvent<HTMLDivElement>) => {
        const el = ref.current;
        if (!el) return;
        el.setPointerCapture(e.pointerId);
        start.current = { x: e.clientX - offset.current.x, y: e.clientY - offset.current.y };
        el.classList.add("is-dragging");

        if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
        // where it was grabbed, -1..1 from the centre
        const r = el.getBoundingClientRect();
        const t = tilt.current;
        t.gx = Math.max(-1, Math.min(1, ((e.clientX - r.left) / r.width) * 2 - 1));
        t.gy = Math.max(-1, Math.min(1, ((e.clientY - r.top) / r.height) * 2 - 1));
        t.px = t.lastX = e.clientX;
        t.py = t.lastY = e.clientY;
        t.swayX = t.swayY = 0;
        el.style.transition = "none";
        cancelAnimationFrame(t.frame);
        t.frame = requestAnimationFrame(tiltLoop);
    };

    useEffect(() => () => cancelAnimationFrame(tilt.current.frame), []);

    const setRef = (el: HTMLDivElement | null) => {
        ref.current = el;
        if (el) (el as HTMLDivElement & { [STARTER]?: Starter })[STARTER] = startDrag;
    };

    useEffect(() => {
        if (ref.current) hitLayers(ref.current).forEach(({ src }) => loadAlpha(src));
    }, [hitMask]);

    const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
        const target = pickTarget(e.clientX, e.clientY);
        if (!target) return; // pressed on empty space of every draggable here
        e.stopPropagation();
        (starterOf(target) ?? startDrag)(e);
    };

    const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
        if (!ref.current) return;
        if (!start.current) {
            // hover: only show the grab hand where something can actually be grabbed
            if (e.pointerType === "mouse") ref.current.style.cursor = pickTarget(e.clientX, e.clientY) ? "" : "auto";
            return;
        }
        tilt.current.px = e.clientX;
        tilt.current.py = e.clientY;
        offset.current = { x: e.clientX - start.current.x, y: e.clientY - start.current.y };
        ref.current.style.translate = `${offset.current.x}px ${offset.current.y}px`;
    };

    const onPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
        start.current = null;
        cancelAnimationFrame(tilt.current.frame);
        tilt.current.lift = 0;
        const el = e.currentTarget;
        el.classList.remove("is-dragging");
        // set down: spring back flat with a little overshoot
        el.style.transition = "transform 450ms cubic-bezier(0.34, 1.56, 0.64, 1)";
        el.style.transform = "";
    };

    return (
        <div
            ref={setRef}
            className={`draggable ${className}`}
            data-hit-mask={hitMask}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerCancel={onPointerUp}
            aria-hidden={decorative || undefined}
        >
            {children}
        </div>
    );
};

export default Draggable;
