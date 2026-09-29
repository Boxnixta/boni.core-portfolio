"use client";

import { useEffect, useRef, useState } from "react";
import { AudioAnalyzer, startDemoBeat, type Bands } from "./audio";
import { noise3 } from "./noise";

/*
  Browser port of "Blob Audio Reactor" (openFrameworks, Creative Coding II).
  Eight nested, radially faded blobs react to sound:
    outer 2 → bass, middle 3 → mids, inner 3 → highs.
  Extra effects like in the original: bass zigzag + bass shimmer (outermost),
  mid bubbles (two inner mid blobs), high shimmer (innermost), waves that ripple
  inward (outer influence) and a clamp so no blob grows past the one outside it.
  Click / drag on the shape = colour splash that fades after 8 s.
  Sound: built-in demo beat, your microphone, or a music file from your computer.
*/

const POINTS = 240;
const LAYERS = 8;
const BAND: ("bass" | "mid" | "high")[] = ["bass", "bass", "mid", "mid", "mid", "high", "high", "high"];
const BASE_HUES = [280, 300, 320, 340, 0, 20, 40, 190];
const SPLASH_MS = 8000;

type Splash = { angle: number; layer: number; born: number; hue: number };
type Mode = "off" | "demo" | "mic" | "file";

const BlobReactor = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const audioRef = useRef<{ ctx: AudioContext; analyzer: AudioAnalyzer; stop?: () => void } | null>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const [mode, setMode] = useState<Mode>("off");
    const [hue, setHue] = useState(0);
    const [gradient, setGradient] = useState(60);
    const [error, setError] = useState("");
    const ui = useRef({ hue: 0, gradient: 60 });
    ui.current = { hue, gradient };
    const splashes = useRef<Splash[]>([]);

    // ---------- audio sources ----------
    const getAudio = async () => {
        if (!audioRef.current) {
            const ctx = new AudioContext();
            audioRef.current = { ctx, analyzer: new AudioAnalyzer(ctx) };
        }
        await audioRef.current.ctx.resume();
        audioRef.current.stop?.();
        audioRef.current.stop = undefined;
        return audioRef.current;
    };

    const playDemo = async () => {
        setError("");
        const a = await getAudio();
        const out = a.ctx.createGain();
        out.connect(a.analyzer.input);
        out.connect(a.ctx.destination);
        const stopBeat = startDemoBeat(a.ctx, out);
        a.stop = () => { stopBeat(); out.disconnect(); };
        setMode("demo");
    };

    const useMic = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            const a = await getAudio();
            const src = a.ctx.createMediaStreamSource(stream);
            src.connect(a.analyzer.input); // not to the speakers → no feedback
            a.stop = () => { src.disconnect(); stream.getTracks().forEach((t) => t.stop()); };
            setMode("mic");
        } catch {
            setError("Microphone not available or permission denied.");
        }
    };

    const playFile = async (file: File) => {
        setError("");
        const a = await getAudio();
        const el = new Audio(URL.createObjectURL(file));
        el.loop = true;
        const src = a.ctx.createMediaElementSource(el);
        src.connect(a.analyzer.input);
        src.connect(a.ctx.destination);
        await el.play();
        a.stop = () => { el.pause(); src.disconnect(); URL.revokeObjectURL(el.src); };
        setMode("file");
    };

    const stop = () => {
        audioRef.current?.stop?.();
        if (audioRef.current) audioRef.current.stop = undefined;
        setMode("off");
    };

    useEffect(() => () => { audioRef.current?.stop?.(); audioRef.current?.ctx.close(); }, []);

    // ---------- drawing ----------
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const g = canvas.getContext("2d")!;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const radii = Array.from({ length: LAYERS }, () => new Float32Array(POINTS));
        const offsets = Array.from({ length: LAYERS }, () => new Float32Array(POINTS));
        const bubbles = Array.from({ length: 6 }, (_, i) => ({ seed: i * 13.7 }));
        let frame = 0, running = false, t = 0;
        const idle: Bands = { sub: 0, bass: 0, mid: 0, high: 0, subDepth: 0.5, highPitch: 0.5, bassHardness: 0 };

        const resize = () => {
            canvas.width = canvas.clientWidth * dpr;
            canvas.height = canvas.clientHeight * dpr;
        };
        resize();
        window.addEventListener("resize", resize);

        const draw = () => {
            if (!running) return;
            t += 1 / 60;
            const W = canvas.width, H = canvas.height, cx = W / 2, cy = H / 2;
            const R = Math.min(W, H) * 0.44;
            const b = audioRef.current && mode !== "off" ? audioRef.current.analyzer.read() : idle;
            // gentle breathing when there is no sound
            const breath = 0.08 + 0.04 * Math.sin(t * 1.3);
            const level = (band: "bass" | "mid" | "high") => Math.max(breath, band === "bass" ? b.bass : band === "mid" ? b.mid : b.high);

            // 1) base shape: radius per point, shifted by noise and scaled by the band loudness
            for (let L = 0; L < LAYERS; L++) {
                const base = R * (1 - L * 0.105);
                const amp = level(BAND[L]);
                for (let i = 0; i < POINTS; i++) {
                    const a = (i / POINTS) * Math.PI * 2;
                    const n = noise3(Math.cos(a) * 1.4 + L * 3.1, Math.sin(a) * 1.4, t * 0.6 + L * 0.2) - 0.5;
                    offsets[L][i] = n * base * (0.12 + amp * 0.55);
                    radii[L][i] = base * (0.92 + amp * 0.12) + offsets[L][i];
                }
            }

            // 2) special effects
            const zzDir = b.subDepth * Math.PI * 2;
            for (let i = 0; i < POINTS; i++) {
                const a = (i / POINTS) * Math.PI * 2;
                const dz = Math.atan2(Math.sin(a - zzDir), Math.cos(a - zzDir));
                // bass zigzag: sharp sine in a narrow angle range on the outermost blob
                if (Math.abs(dz) < 0.6) radii[0][i] += Math.sin(a * 60) * R * 0.05 * b.sub * (1 - Math.abs(dz) / 0.6);
                // bass shimmer: opposite side, only on hard hits
                const ds = Math.atan2(Math.sin(a - zzDir - Math.PI), Math.cos(a - zzDir - Math.PI));
                if (Math.abs(ds) < 0.8) radii[0][i] += (Math.random() - 0.5) * R * 0.08 * b.sub * b.bassHardness;
                // high shimmer: innermost blob, position follows the treble pitch
                const hp = b.highPitch * Math.PI - Math.PI / 2;
                const dh = Math.atan2(Math.sin(a - hp), Math.cos(a - hp));
                if (Math.abs(dh) < 0.7) radii[LAYERS - 1][i] += (Math.random() - 0.5) * R * 0.05 * b.high;
            }

            // 3) outer influence (waves ripple inward) + clamp to the blob outside
            for (let L = 1; L < LAYERS; L++) {
                for (let i = 0; i < POINTS; i++) {
                    radii[L][i] += offsets[L - 1][i] * 0.35;
                    const max = radii[L - 1][i] * 0.97;
                    if (radii[L][i] > max) radii[L][i] += (max - radii[L][i]) * 0.8;
                }
            }

            // 4) draw
            g.clearRect(0, 0, W, H);
            const now = performance.now();
            splashes.current = splashes.current.filter((s) => now - s.born < SPLASH_MS);
            for (let L = 0; L < LAYERS; L++) {
                const hL = (BASE_HUES[L] + ui.current.hue) % 360;
                const grad = g.createRadialGradient(cx, cy, 0, cx, cy, R * (1 - L * 0.105) * 1.1);
                grad.addColorStop(0, `hsla(${hL}, 90%, ${60 + ui.current.gradient * 0.3}%, 1)`);
                grad.addColorStop(1, `hsla(${(hL + ui.current.gradient) % 360}, 85%, 55%, 1)`);
                g.beginPath();
                for (let i = 0; i <= POINTS; i++) {
                    const a = (i / POINTS) * Math.PI * 2;
                    const r = radii[L][i % POINTS];
                    const x = cx + Math.cos(a) * r, y = cy + Math.sin(a) * r;
                    if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
                }
                g.closePath();
                g.fillStyle = grad;
                g.fill();

                // colour splashes on this layer, fading out
                for (const s of splashes.current.filter((s) => s.layer === L)) {
                    const life = 1 - (now - s.born) / SPLASH_MS;
                    const r = radii[L][Math.round((s.angle / (Math.PI * 2)) * POINTS) % POINTS] * 0.8;
                    const sx = cx + Math.cos(s.angle) * r, sy = cy + Math.sin(s.angle) * r;
                    const sg = g.createRadialGradient(sx, sy, 0, sx, sy, R * 0.35);
                    sg.addColorStop(0, `hsla(${s.hue}, 95%, 60%, ${0.8 * life})`);
                    sg.addColorStop(1, `hsla(${s.hue}, 95%, 60%, 0)`);
                    g.save(); g.clip(); g.fillStyle = sg; g.fillRect(0, 0, W, H); g.restore();
                }

                // mid bubbles on the two inner mid blobs
                if (L === 3 || L === 4) {
                    for (const bb of bubbles) {
                        const a = noise3(bb.seed, t * 0.2, L) * Math.PI * 4;
                        const rr = radii[L][Math.floor(((a % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI * 2) * POINTS) % POINTS];
                        const d = rr * (0.4 + noise3(bb.seed + 5, t * 0.3, L) * 0.4);
                        const size = Math.min(R * 0.06, R * 0.012 + b.mid * R * 0.05);
                        g.beginPath();
                        g.arc(cx + Math.cos(a) * d, cy + Math.sin(a) * d, size, 0, Math.PI * 2);
                        g.fillStyle = `hsla(${(hL + 180) % 360}, 90%, 85%, 0.8)`;
                        g.fill();
                    }
                }
            }
            frame = requestAnimationFrame(draw);
        };

        const io = new IntersectionObserver(([e]) => {
            running = e.isIntersecting;
            if (running) frame = requestAnimationFrame(draw);
            else cancelAnimationFrame(frame);
        });
        io.observe(canvas);

        // click / drag = colour splash on the layer under the pointer
        const splash = (e: PointerEvent) => {
            const r = canvas.getBoundingClientRect();
            const x = (e.clientX - r.left) * dpr - canvas.width / 2;
            const y = (e.clientY - r.top) * dpr - canvas.height / 2;
            const angle = (Math.atan2(y, x) + Math.PI * 2) % (Math.PI * 2);
            const dist = Math.hypot(x, y);
            const idx = Math.round((angle / (Math.PI * 2)) * POINTS) % POINTS;
            let layer = -1;
            for (let L = 0; L < LAYERS; L++) if (dist < radii[L][idx]) layer = L;
            if (layer < 0) return;
            const last = splashes.current[splashes.current.length - 1];
            if (last && performance.now() - last.born < 60) return;
            splashes.current.push({ angle, layer, born: performance.now(), hue: Math.random() * 360 });
        };
        const onDown = (e: PointerEvent) => { splash(e); canvas.setPointerCapture(e.pointerId); };
        const onMove = (e: PointerEvent) => { if (e.buttons) splash(e); };
        canvas.addEventListener("pointerdown", onDown);
        canvas.addEventListener("pointermove", onMove);

        return () => {
            running = false;
            cancelAnimationFrame(frame);
            io.disconnect();
            window.removeEventListener("resize", resize);
            canvas.removeEventListener("pointerdown", onDown);
            canvas.removeEventListener("pointermove", onMove);
        };
    }, [mode]);

    return (
        <div className="blob-reactor not-prose">
            <canvas ref={canvasRef} className="blob-canvas" aria-label="Audio-reactive blob visual" role="img" />
            <div className="blob-controls">
                <div className="flex flex-wrap gap-3">
                    <button type="button" className={`btn filter-pill ${mode === "demo" ? "is-active" : ""}`} onClick={playDemo}>▶ Demo beat</button>
                    <button type="button" className={`btn filter-pill ${mode === "mic" ? "is-active" : ""}`} onClick={useMic}>Microphone</button>
                    <button type="button" className={`btn filter-pill ${mode === "file" ? "is-active" : ""}`} onClick={() => fileRef.current?.click()}>Your music file</button>
                    {mode !== "off" && <button type="button" className="btn filter-pill" onClick={stop}>■ Stop</button>}
                    <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && playFile(e.target.files[0])} />
                </div>
                <label className="blob-slider">
                    <span>Hue</span>
                    <input type="range" min={0} max={360} value={hue} onChange={(e) => setHue(+e.target.value)} />
                </label>
                <label className="blob-slider">
                    <span>Gradient</span>
                    <input type="range" min={0} max={120} value={gradient} onChange={(e) => setGradient(+e.target.value)} />
                </label>
                {error && <p className="text-sm text-red-600 max-w-none">{error}</p>}
                <p className="blob-hint">click or drag on the blob for a colour splash · your file stays on your computer</p>
            </div>
        </div>
    );
};

export default BlobReactor;
