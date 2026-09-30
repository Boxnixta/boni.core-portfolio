/*
  1:1 port of Blob.cpp: one layer of the shape.
  240 points around a centre, noise displacement scaled by the audio value,
  zigzag / shimmer / bubbles / outer influence / clamp / hue splashes.
*/
import { noise3 } from "./noise";
import { type RGBA, toHsb, fromHsb, lerpColor, css } from "./color";

export type Band = "BASS" | "MID" | "HIGH";
const N = 240, BUBBLES = 6, TWO_PI = Math.PI * 2, PI = Math.PI, HALF_PI = Math.PI / 2;
const ofNoise = (x: number, y = 0) => noise3(x, y, 0.5);
const map = (v: number, a: number, b: number, c: number, d: number) => c + ((v - a) / (b - a)) * (d - c);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const OFF_WHITE: RGBA = [250, 247, 240, 255];

type Splash = { angle: number; strength: number; width: number; start: number; session: number };

export class Blob {
    radius: number; color: RGBA; lag: number; band: Band;
    radii = new Float32Array(N);
    pos = { x: 0, y: 0 };
    private current = 0;
    private noiseOffset = Math.random() * 1000;
    private bubbleTime = Math.random() * 1000;
    private bubbleAngle = new Float32Array(BUBBLES);
    private bubbleSize = new Float32Array(BUBBLES);
    private splashes: Splash[] = [];
    private hueTarget = new Float32Array(N);
    private hueCurrent = new Float32Array(N);

    constructor(radius: number, color: RGBA, lag: number, band: Band, cx: number, cy: number) {
        this.radius = radius; this.color = color; this.lag = lag; this.band = band;
        this.pos = { x: cx, y: cy };
        this.radii.fill(radius);
    }

    update(audio: number, cx: number, cy: number, now: number) {
        this.pos.x += (cx - this.pos.x) * this.lag;
        this.pos.y += (cy - this.pos.y) * this.lag;
        this.current += (audio - this.current) * (audio > this.current ? 0.35 : 0.06);
        this.noiseOffset += 0.002;
        this.bubbleTime += 0.01;
        const amp = this.radius * (0.05 + this.current * 0.2);
        for (let i = 0; i < N; i++) {
            const a = (i / N) * TWO_PI;
            const n = ofNoise(Math.cos(a) * 0.6 + this.noiseOffset, Math.sin(a) * 0.6 + this.noiseOffset);
            this.radii[i] = this.radius + map(n, 0, 1, -amp, amp);
        }

        // hue splashes: live 8 s, fade in 0.3 s / out 1.5 s, strongest per click gesture
        this.splashes = this.splashes.filter((s) => now - s.start <= 8);
        this.hueTarget.fill(0);
        const sessions = [...new Set(this.splashes.map((s) => s.session))];
        const contrib = new Float32Array(N);
        for (const sid of sessions) {
            contrib.fill(0);
            for (const s of this.splashes) {
                if (s.session !== sid) continue;
                const age = now - s.start;
                let env = Math.min(clamp(age / 0.3, 0, 1), clamp((8 - age) / 1.5, 0, 1));
                env = env * env * (3 - 2 * env);
                for (let i = 0; i < N; i++) {
                    const f = this.sector((i / N) * TWO_PI, s.angle, s.width);
                    if (f > 0) contrib[i] = Math.max(contrib[i], s.strength * env * f);
                }
            }
            for (let i = 0; i < N; i++) this.hueTarget[i] = clamp(this.hueTarget[i] + contrib[i], -128, 128);
        }
        for (let i = 0; i < N; i++) this.hueCurrent[i] += (this.hueTarget[i] - this.hueCurrent[i]) * 0.15;
    }

    private sector(angle: number, center: number, width: number) {
        let d = (angle - center + PI) % TWO_PI;
        if (d < 0) d += TWO_PI;
        d -= PI;
        const f = 1 - clamp(Math.abs(d) / (width * 0.5), 0, 1);
        return f <= 0 ? 0 : f * f * (3 - 2 * f);
    }

    applySubBassZigzag(subBass: number, depth: number) {
        if (subBass <= 0.001) return;
        const c = depth * TWO_PI, amp = subBass * this.radius * 0.018;
        for (let i = 0; i < N; i++) {
            const a = (i / N) * TWO_PI, f = this.sector(a, c, 1.3);
            if (f > 0) this.radii[i] += Math.sin(a * 120 + this.noiseOffset * 40) * amp * f;
        }
    }

    applyBassShimmer(level0: number, hardness: number, center: number, t: number) {
        const level = level0 * hardness;
        if (level <= 0.001) return;
        const amp = level * this.radius * 0.05;
        if (amp < 0.05) return;
        for (let i = 0; i < N; i++) {
            const a = (i / N) * TWO_PI, f = this.sector(a, center, 1.6);
            if (f <= 0) continue;
            const n = ofNoise(Math.cos(a) * 7 + t + this.noiseOffset * 0.05, Math.sin(a) * 7 + t * 1.3 + this.noiseOffset * 0.05);
            this.radii[i] += map(n, 0, 1, -amp, amp) * f;
        }
    }

    applyOuterInfluence(outer: Blob, k: number) {
        for (let i = 0; i < N; i++) this.radii[i] += ((outer.radii[i] - outer.radius) / outer.radius) * this.radius * k;
    }

    clampToOuter(outer: Blob, margin: number, softness: number) {
        const dx = this.pos.x - outer.pos.x, dy = this.pos.y - outer.pos.y;
        for (let i = 0; i < N; i++) {
            const a = (i / N) * TWO_PI;
            const ceiling = outer.radii[i] - margin - (dx * Math.cos(a) + dy * Math.sin(a));
            const r = this.radii[i];
            const h = clamp(0.5 + (0.5 * (ceiling - r)) / softness, 0, 1);
            this.radii[i] = lerp(ceiling, r, h) - softness * h * (1 - h);
        }
    }

    applyMidBubbles(mid: number, outer: Blob, margin: number) {
        const maxR = this.radius * 0.1;
        for (let k = 0; k < BUBBLES; k++) {
            const angle = ofNoise(k * 13.7 + this.bubbleTime * 0.05) * TWO_PI;
            let pulse = ofNoise(k * 29.3 + this.bubbleTime * 0.6);
            pulse *= pulse;
            let target = mid * maxR * pulse;
            const raw = (angle / TWO_PI) * N;
            const i0 = ((Math.floor(raw) % N) + N) % N, i1 = (i0 + 1) % N, fr = raw - Math.floor(raw);
            const rMax = lerp(outer.radii[i0], outer.radii[i1], fr) - margin - this.radii[i0];
            target = clamp(target, 0, rMax > 0 ? rMax : 0);
            this.bubbleAngle[k] = angle;
            this.bubbleSize[k] += (target - this.bubbleSize[k]) * (target > this.bubbleSize[k] ? 0.35 : 0.1);
        }
    }

    applyHighShimmer(high: number, pitch: number, strength: number, t: number) {
        const th = 0.08;
        if (high <= th) return;
        const amp = ((high - th) / (1 - th)) * strength * this.radius * 0.08;
        if (amp < 0.05) return;
        const c = map(pitch, 0, 1, -HALF_PI, PI / 4);
        for (let i = 0; i < N; i++) {
            const a = (i / N) * TWO_PI, f = this.sector(a, c, 4.2);
            if (f <= 0) continue;
            const n = ofNoise(Math.cos(a) * 3.5 + t + this.noiseOffset * 0.05, Math.sin(a) * 3.5 + t * 1.3 + this.noiseOffset * 0.05);
            this.radii[i] += map(n, 0, 1, -amp, amp) * f;
        }
    }

    tryAddHueSplash(x: number, y: number, strength: number, width: number, session: number, now: number) {
        const rx = x - this.pos.x, ry = y - this.pos.y;
        let a = Math.atan2(ry, rx);
        if (a < 0) a += TWO_PI;
        const idx = Math.floor((a / TWO_PI) * N) % N;
        if (Math.hypot(rx, ry) > this.radii[idx]) return false;
        this.splashes.push({ angle: a, strength, width, start: now, session });
        return true;
    }

    // ---------- drawing ----------
    private pointColor(i: number): RGBA {
        const off = this.hueCurrent[i];
        if (Math.abs(off) < 0.5) return this.color;
        const [h, s, v] = toHsb(this.color);
        return fromHsb(h + off, s, v, this.color[3]);
    }

    private ring(g: CanvasRenderingContext2D, rOf: (i: number) => number) {
        g.beginPath();
        for (let i = 0; i <= N; i++) {
            const idx = i % N, a = (idx / N) * TWO_PI, r = Math.max(0, rOf(idx));
            const x = this.pos.x + Math.cos(a) * r, y = this.pos.y + Math.sin(a) * r;
            if (i === 0) g.moveTo(x, y); else g.lineTo(x, y);
        }
        g.closePath();
    }

    /*
      Off-white centre that fades softly into the full colour towards the edge.
      Instead of stacked rings, each layer is filled once with a radial gradient
      (smoothstep curve sampled into many stops), so there are no visible steps.
      Wherever a hue splash is active, that wedge is painted again in the shifted colour.
    */
    private gradient(g: CanvasRenderingContext2D, c: RGBA, meanR: number, band: number) {
        const grad = g.createRadialGradient(this.pos.x, this.pos.y, 0, this.pos.x, this.pos.y, Math.max(1, meanR));
        const center = lerpColor(c, OFF_WHITE, 0.85);
        const t0 = Math.max(0, (meanR - band) / meanR);
        grad.addColorStop(0, css(center));
        grad.addColorStop(t0, css(center));
        const STEPS = 16;
        for (let s = 1; s <= STEPS; s++) {
            const t = s / STEPS, e = t * t * (3 - 2 * t);
            grad.addColorStop(t0 + (1 - t0) * t, css(lerpColor(center, c, e)));
        }
        return grad;
    }

    draw(g: CanvasRenderingContext2D) {
        const band = Math.min(100, this.radius * 0.7);
        let meanR = 0;
        for (let i = 0; i < N; i++) meanR += this.radii[i];
        meanR /= N;

        g.save();
        g.globalAlpha = this.color[3] / 255;
        this.ring(g, (i) => this.radii[i]);
        g.fillStyle = this.gradient(g, this.color, meanR, band);
        g.fill();

        // hue splashes: repaint only the shifted wedges (opaque, so overlaps don't add up)
        g.globalAlpha = 1;
        for (let i = 0; i < N; i++) {
            if (Math.abs(this.hueCurrent[i]) < 0.5) continue;
            const j = (i + 1) % N;
            const a0 = (i / N) * TWO_PI - 0.003, a1 = ((i + 1) / N) * TWO_PI + 0.003;
            g.beginPath();
            g.moveTo(this.pos.x, this.pos.y);
            g.lineTo(this.pos.x + Math.cos(a0) * this.radii[i], this.pos.y + Math.sin(a0) * this.radii[i]);
            g.lineTo(this.pos.x + Math.cos(a1) * this.radii[j], this.pos.y + Math.sin(a1) * this.radii[j]);
            g.closePath();
            g.fillStyle = this.gradient(g, this.pointColor(i), meanR, band);
            g.fill();
        }
        g.restore();
    }

    drawBubbles(g: CanvasRenderingContext2D) {
        g.fillStyle = css(this.color);
        const ringR = (a: number) => {
            const raw = (a / TWO_PI) * N;
            const i0 = ((Math.floor(raw) % N) + N) % N, i1 = (i0 + 1) % N;
            return lerp(this.radii[i0], this.radii[i1], raw - Math.floor(raw));
        };
        for (let k = 0; k < BUBBLES; k++) {
            const r = this.bubbleSize[k];
            if (r < 0.5) continue;
            const a = this.bubbleAngle[k], R = ringR(a);
            g.beginPath(); g.arc(this.pos.x + Math.cos(a) * R, this.pos.y + Math.sin(a) * R, r, 0, TWO_PI); g.fill();
            const companions = ofNoise(k * 7.1 + this.bubbleTime * 0.2) > 0.35 ? 2 : 1;
            for (let c = 0; c < companions; c++) {
                const dir = c === 0 ? 1 : -1, cr = r * (0.5 - c * 0.15);
                const oa = a + (dir * (cr * 2.2)) / R, OR = ringR(oa);
                g.beginPath(); g.arc(this.pos.x + Math.cos(oa) * OR, this.pos.y + Math.sin(oa) * OR, cr, 0, TWO_PI); g.fill();
            }
        }
    }
}
