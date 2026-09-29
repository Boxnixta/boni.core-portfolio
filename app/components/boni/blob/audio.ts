/*
  Web Audio version of the AudioAnalyzer class from the openFrameworks app.
  Like the original it uses simple filters instead of an FFT:
  lowpass → bass, highpass → highs, both combined → mids.
  Each band gives a smooth 0–1 loudness (fast attack, slow release, auto gain).
  Extra values: sub-bass depth (40 Hz vs 70 Hz), high pitch (19 kHz vs 11 kHz)
  and bass hardness (how fast the sub-bass jumps between frames).
*/
export type Bands = {
    sub: number; bass: number; mid: number; high: number;
    subDepth: number; highPitch: number; bassHardness: number;
};

type Probe = { analyser: AnalyserNode; buf: Float32Array<ArrayBuffer>; env: number; peak: number };

const makeFilterChain = (ctx: AudioContext, input: AudioNode, specs: [BiquadFilterType, number][]) => {
    let node: AudioNode = input;
    for (const [type, freq] of specs) {
        const f = ctx.createBiquadFilter();
        f.type = type;
        f.frequency.value = freq;
        f.Q.value = 0.707;
        node.connect(f);
        node = f;
    }
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    node.connect(analyser);
    return { analyser, buf: new Float32Array(analyser.fftSize), env: 0, peak: 0.02 } as Probe;
};

export class AudioAnalyzer {
    ctx: AudioContext;
    input: GainNode;
    private probes: Record<string, Probe>;
    private prevSub = 0;

    constructor(ctx: AudioContext) {
        this.ctx = ctx;
        this.input = ctx.createGain();
        this.probes = {
            sub: makeFilterChain(ctx, this.input, [["lowpass", 70]]),
            sub40: makeFilterChain(ctx, this.input, [["lowpass", 40]]),
            bass: makeFilterChain(ctx, this.input, [["lowpass", 250]]),
            mid: makeFilterChain(ctx, this.input, [["highpass", 250], ["lowpass", 2500]]),
            high: makeFilterChain(ctx, this.input, [["highpass", 4000]]),
            high11: makeFilterChain(ctx, this.input, [["highpass", 11000]]),
            high19: makeFilterChain(ctx, this.input, [["highpass", 16000]]),
        };
    }

    private rms(p: Probe) {
        p.analyser.getFloatTimeDomainData(p.buf);
        let s = 0;
        for (let i = 0; i < p.buf.length; i++) s += p.buf[i] * p.buf[i];
        return Math.sqrt(s / p.buf.length);
    }

    // 0–1 loudness with auto gain: rises fast when loud, eases back down when quiet
    private level(p: Probe) {
        const v = this.rms(p);
        p.peak = Math.max(v, p.peak * 0.998, 0.004);
        const target = Math.min(1, v / p.peak);
        p.env += (target - p.env) * (target > p.env ? 0.5 : 0.08);
        return p.env;
    }

    read(): Bands {
        const P = this.probes;
        const sub = this.level(P.sub);
        const bass = this.level(P.bass);
        const mid = this.level(P.mid);
        const high = this.level(P.high);
        const r40 = this.rms(P.sub40), r70 = this.rms(P.sub) + 1e-6;
        const r11 = this.rms(P.high11) + 1e-6, r19 = this.rms(P.high19);
        const bassHardness = Math.max(0, Math.min(1, (sub - this.prevSub) * 6));
        this.prevSub = sub;
        return {
            sub, bass, mid, high,
            subDepth: Math.min(1, r40 / r70),
            highPitch: Math.min(1, (r19 / r11) * 3),
            bassHardness,
        };
    }
}

/*
  Small built-in demo track so visitors can try it without music or microphone:
  kick + sub bass at 120 BPM, off-beat hi-hats, a plucky mid arp.
*/
export const startDemoBeat = (ctx: AudioContext, out: AudioNode) => {
    const master = ctx.createGain();
    master.gain.value = 0.55;
    master.connect(out);

    const noiseBuf = ctx.createBuffer(1, ctx.sampleRate * 0.5, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;

    const beat = 60 / 120;
    const notes = [220, 277.2, 329.6, 415.3, 329.6, 277.2, 246.9, 329.6];
    let next = ctx.currentTime + 0.05;
    let step = 0;

    const schedule = () => {
        while (next < ctx.currentTime + 0.2) {
            const t = next;
            const sixteenth = step % 4;
            const bar = Math.floor(step / 16) % 4;
            if (sixteenth === 0) {
                // kick: fast pitch drop
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.frequency.setValueAtTime(140, t);
                o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
                g.gain.setValueAtTime(1, t);
                g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                o.connect(g).connect(master);
                o.start(t); o.stop(t + 0.4);
            }
            if (sixteenth === 2) {
                // off-beat hi-hat
                const n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
                n.buffer = noiseBuf; hp.type = "highpass"; hp.frequency.value = 7000;
                g.gain.setValueAtTime(0.35, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.06);
                n.connect(hp).connect(g).connect(master);
                n.start(t); n.stop(t + 0.08);
            }
            if (step % 2 === 1 && bar !== 3) {
                // mid arp
                const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
                o.type = "sawtooth"; o.frequency.value = notes[(step >> 1) % notes.length];
                lp.type = "lowpass"; lp.frequency.value = 1800;
                g.gain.setValueAtTime(0.12, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                o.connect(lp).connect(g).connect(master);
                o.start(t); o.stop(t + 0.2);
            }
            if (sixteenth === 0 && step % 8 === 0) {
                // sub bass note
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.type = "sine"; o.frequency.value = bar % 2 ? 49 : 55;
                g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + beat * 1.8);
                o.connect(g).connect(master);
                o.start(t); o.stop(t + beat * 2);
            }
            next += beat / 4;
            step++;
        }
    };
    schedule();
    const id = setInterval(schedule, 50);
    return () => { clearInterval(id); master.disconnect(); };
};
