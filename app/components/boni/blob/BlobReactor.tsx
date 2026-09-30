"use client";

import { useEffect, useRef, useState } from "react";
import { AudioAnalyzer, startDemoBeat, type Bands } from "./audio";
import { Blob, type Band } from "./Blob";
import { type RGBA, toHsb, fromHsb } from "./color";
import { ofNoise } from "./noise";

/*
  Browser port of "Blob Audio Reactor" (openFrameworks, Creative Coding II).
  Logic, colours and numbers come 1:1 from ofApp.cpp / Blob.cpp / AudioAnalyzer.cpp.
  The app draws in the same 1024 × 768 space as the openFrameworks window (main.cpp),
  scaled to the canvas, and update() runs at a fixed 60 steps per second like
  ofSetFrameRate(60) — also on 120 Hz screens, where it used to run twice as fast
  (faster release = the blob calmed down too quickly).
*/

// ofApp::setup(): from outside (big, light) to inside (small, saturated) – the starting blue
const BASE: RGBA[] = [
    [161, 191, 242, 222], [145, 175, 238, 226], [126, 159, 234, 230], [107, 141, 230, 234],
    [91, 124, 226, 238], [74, 104, 218, 242], [58, 86, 210, 248], [44, 66, 198, 255],
];
const LAYERS: [number, number, Band][] = [
    [280, 0.03, "BASS"], [250, 0.04, "BASS"], [220, 0.05, "MID"], [190, 0.065, "MID"],
    [160, 0.08, "MID"], [130, 0.1, "HIGH"], [100, 0.12, "HIGH"], [50, 0.18, "HIGH"],
];
const W = 1024, H = 768, STEP = 1 / 60;

type Mode = "off" | "track" | "demo" | "mic" | "file";

// Songs from Pixabay (Pixabay Content License: free to use, no attribution required – credited anyway)
const TRACKS = [
    { id: "techno", title: "Underground Minimal Techno 26", artist: "officeMIKADO", src: "/audio/underground-minimal-techno-26.mp3" },
    { id: "gloss", title: "Water Gloss (Frutiger Aero)", artist: "9JackJack8", src: "/audio/water-gloss.mp3" },
    { id: "aquatic", title: "Aquatic Ambience (Frutiger Aero Chill)", artist: "9JackJack8", src: "/audio/aquatic-ambience.mp3" },
];

const BlobReactor = () => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileRef = useRef<HTMLInputElement>(null);
    const audioRef = useRef<{ ctx: AudioContext; analyzer: AudioAnalyzer; stop?: () => void } | null>(null);
    const modeRef = useRef<Mode>("off");
    const [mode, setModeState] = useState<Mode>("off");
    const [track, setTrack] = useState(TRACKS[0].id);
    const [hue, setHue] = useState(0);
    const [gradient, setGradient] = useState(0);
    const [error, setError] = useState("");
    const ui = useRef({ hue: 0, gradient: 0 });
    ui.current = { hue, gradient };

    const setMode = (m: Mode) => { modeRef.current = m; setModeState(m); };

    // ---------- sound sources (like toggleMode: full reset on every switch) ----------
    const getAudio = async () => {
        if (!audioRef.current) {
            const ctx = new AudioContext();
            audioRef.current = { ctx, analyzer: new AudioAnalyzer(ctx) };
        }
        const a = audioRef.current;
        await a.ctx.resume();
        a.stop?.();
        a.stop = undefined;
        a.analyzer.reset();
        return a;
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
            const stream = await navigator.mediaDevices.getUserMedia({ audio: { echoCancellation: false, noiseSuppression: false, autoGainControl: false } });
            const a = await getAudio();
            const src = a.ctx.createMediaStreamSource(stream);
            src.connect(a.analyzer.input); // not to the speakers → no feedback
            a.stop = () => { src.disconnect(); stream.getTracks().forEach((t) => t.stop()); };
            setMode("mic");
        } catch {
            setError("Microphone could not be opened. Please allow microphone access in your browser.");
        }
    };

    // plays a song through the analyzer and the speakers (used for the Pixabay tracks and your own file)
    const playUrl = async (url: string, m: Mode, revoke = false) => {
        setError("");
        const a = await getAudio();
        const el = new Audio(url);
        el.loop = true;
        const src = a.ctx.createMediaElementSource(el);
        src.connect(a.analyzer.input);
        src.connect(a.ctx.destination);
        try {
            await el.play();
        } catch {
            setError("The song could not be played.");
            return;
        }
        a.stop = () => { el.pause(); src.disconnect(); if (revoke) URL.revokeObjectURL(url); };
        setMode(m);
    };
    const playTrack = (id: string) => {
        setTrack(id);
        playUrl(TRACKS.find((t) => t.id === id)!.src, "track");
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
        if (audioRef.current) { audioRef.current.stop = undefined; audioRef.current.analyzer.reset(); }
        setMode("off");
    };

    useEffect(() => () => { audioRef.current?.stop?.(); audioRef.current?.ctx.close(); }, []);

    // ---------- the app (setup / update / draw) ----------
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const g = canvas.getContext("2d")!;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const blobs = LAYERS.map(([r, lag, band], i) => new Blob(r, BASE[i], lag, band, W / 2, H / 2));
        const baseHsb = BASE.map((c) => toHsb(c));
        const silent: Bands = { subBass: 0, subBassDepth: 0, bassReal: 0, midReal: 0, highReal: 0, highPitch: 0, bassHardness: 0 };
        let noiseTime = 0, highShimmerTime = 0, frame = 0, running = false, acc = 0, last = 0;
        let bands: Bands = silent;
        let lastSplash = -10, session = 0;
        const t0 = performance.now();
        const now = () => (performance.now() - t0) / 1000;

        const resize = () => {
            canvas.width = Math.round(canvas.clientWidth * dpr);
            canvas.height = Math.round(canvas.clientHeight * dpr);
        };
        resize();
        window.addEventListener("resize", resize);

        const update = () => {
            noiseTime += 0.005;
            highShimmerTime += 0.15;
            const a = audioRef.current && modeRef.current !== "off" ? audioRef.current.analyzer.update() : silent;
            const cx = W / 2 + (ofNoise(noiseTime) * 120 - 60);
            const cy = H / 2 + (ofNoise(noiseTime + 100) * 120 - 60);

            // hue slider turns all layers together, gradient adds an offset that fades from outside to inside
            const last = blobs.length - 1;
            blobs.forEach((b, i) => {
                const [h, s, v] = baseHsb[i];
                b.color = fromHsb((h + ui.current.hue + ui.current.gradient * (1 - i / last)) % 256, s, v, BASE[i][3]);
            });

            const t = now();
            blobs.forEach((b, i) => {
                let v = b.band === "BASS" ? a.bassReal : b.band === "MID" ? a.midReal : a.highReal;
                if (i === last) v = Math.min(1, v * 1.6);
                b.update(v, cx, cy, t);
            });

            blobs[0].applySubBassZigzag(a.subBass, a.subBassDepth);
            blobs[0].applyBassShimmer(a.subBass, a.bassHardness, a.subBassDepth * Math.PI * 2 + Math.PI, highShimmerTime);
            const margin = 4;
            blobs[3].applyMidBubbles(a.midReal, blobs[2], margin);
            blobs[4].applyMidBubbles(a.midReal, blobs[3], margin);
            for (let i = 1; i < blobs.length; i++) blobs[i].applyOuterInfluence(blobs[i - 1], 0.35);
            blobs[last].applyHighShimmer(a.highReal, a.highPitch, 1, highShimmerTime);
            for (let i = last - 1; i >= 0; i--) blobs[i].applyOuterInfluence(blobs[i + 1], 0.35);
            for (let i = 1; i < blobs.length; i++) blobs[i].clampToOuter(blobs[i - 1], margin, 18);
            return a;
        };

        const draw = (a: Bands) => {
            const scale = Math.min(canvas.width / W, canvas.height / H);
            g.setTransform(1, 0, 0, 1, 0, 0);
            // clear the whole frame (no ghost trails behind the blobs)
            g.fillStyle = "rgb(245,242,235)";
            g.fillRect(0, 0, canvas.width, canvas.height);
            g.setTransform(scale, 0, 0, scale, (canvas.width - W * scale) / 2, (canvas.height - H * scale) / 2);
            blobs.forEach((b, i) => {
                b.draw(g);
                if (i === 3 || i === 4) b.drawBubbles(g);
            });
            // analyzer readout (top left), like the debug text of the app
            g.setTransform(1, 0, 0, 1, 0, 0);
            g.fillStyle = "rgb(245,242,235)"; // clear the text area every frame (no trails on the numbers)
            g.fillRect(0, 0, 160 * dpr, 100 * dpr);
            g.fillStyle = "rgba(0,0,0,0.75)";
            g.font = `${11 * dpr}px ui-monospace, Menlo, monospace`;
            [["SUBBASS", a.subBass], ["BASSREAL", a.bassReal], ["MIDREAL", a.midReal], ["HIGHREAL", a.highReal], ["HIGHPITCH", a.highPitch]]
                .forEach(([k, v], i) => g.fillText(`${k}:${(v as number).toFixed(3)}`, 12 * dpr, (20 + i * 16) * dpr));
        };

        // fixed 60 Hz logic, drawing at whatever rate the screen has
        const loop = (ts: number) => {
            if (!running) return;
            acc += Math.min(0.1, last ? (ts - last) / 1000 : STEP);
            last = ts;
            let steps = 0;
            while (acc >= STEP && steps < 6) { bands = update(); acc -= STEP; steps++; }
            if (steps === 6) acc = 0;
            draw(bands);
            frame = requestAnimationFrame(loop);
        };
        const io = new IntersectionObserver(([e]) => {
            running = e.isIntersecting;
            if (running) { last = 0; frame = requestAnimationFrame(loop); }
            else cancelAnimationFrame(frame);
        });
        io.observe(canvas);

        // click / drag on a blob = local hue splash on the topmost layer that was hit
        const toApp = (e: PointerEvent) => {
            const r = canvas.getBoundingClientRect();
            const scale = Math.min(r.width / W, r.height / H);
            return { x: (e.clientX - r.left - (r.width - W * scale) / 2) / scale, y: (e.clientY - r.top - (r.height - H * scale) / 2) / scale };
        };
        const splash = (e: PointerEvent) => {
            const t = now();
            if (t - lastSplash < 0.05) return;
            lastSplash = t;
            const p = toApp(e);
            for (let i = blobs.length - 1; i >= 0; i--) if (blobs[i].tryAddHueSplash(p.x, p.y, 70, 1.2, session, t)) break;
        };
        const onDown = (e: PointerEvent) => { session++; canvas.setPointerCapture(e.pointerId); splash(e); };
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
    }, []);

    return (
        <div className="blob-reactor not-prose">
            <canvas ref={canvasRef} className="blob-canvas" aria-label="Audio-reactive blob visual" role="img" />
            <div className="blob-controls">
                <p className="blob-source">source: {mode === "off" ? "–" : mode === "track" ? TRACKS.find((t) => t.id === track)!.title : mode === "demo" ? "demo beat" : mode === "mic" ? "microphone (live)" : "your file"}</p>
                <div className="flex flex-col gap-2" role="group" aria-label="Songs">
                    {TRACKS.map((t) => (
                        <button key={t.id} type="button" className={`btn filter-pill justify-start text-left ${mode === "track" && track === t.id ? "is-active" : ""}`} onClick={() => playTrack(t.id)}>
                            ▶ {t.title}
                        </button>
                    ))}
                </div>
                <div className="flex flex-wrap gap-3">
                    <button type="button" className={`btn filter-pill ${mode === "demo" ? "is-active" : ""}`} onClick={playDemo}>Demo beat</button>
                    <button type="button" className={`btn filter-pill ${mode === "mic" ? "is-active" : ""}`} onClick={useMic}>Microphone</button>
                    <button type="button" className={`btn filter-pill ${mode === "file" ? "is-active" : ""}`} onClick={() => fileRef.current?.click()}>Your music file</button>
                    {mode !== "off" && <button type="button" className="btn filter-pill" onClick={stop}>■ Stop</button>}
                    <input ref={fileRef} type="file" accept="audio/*" className="hidden" onChange={(e) => e.target.files?.[0] && playFile(e.target.files[0])} />
                </div>
                <label className="blob-slider">
                    <span>HUE: {hue}</span>
                    <input type="range" min={0} max={255} value={hue} onChange={(e) => setHue(+e.target.value)} />
                </label>
                <label className="blob-slider">
                    <span>GRADIENT: {gradient}</span>
                    <input type="range" min={0} max={255} value={gradient} onChange={(e) => setGradient(+e.target.value)} />
                </label>
                {error && <p className="max-w-none text-sm text-red-600">{error}</p>}
                <p className="blob-hint">click or drag on the blob for a colour splash · your file stays on your computer</p>
                <p className="blob-hint">
                    Music:{" "}
                    {TRACKS.map((t, i) => (
                        <span key={t.id}>{t.title} by {t.artist}{i < TRACKS.length - 1 ? " · " : ""}</span>
                    ))}{" "}
                    via <a className="underline" href="https://pixabay.com/music/" target="_blank" rel="noopener noreferrer">Pixabay</a>
                </p>
            </div>
        </div>
    );
};

export default BlobReactor;
