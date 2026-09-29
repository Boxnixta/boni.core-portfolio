/*
  1:1 port of AudioAnalyzer.cpp (Creative Coding II final project).
  Same one-pole filters, same cutoffs, same gains and smoothing:
    subBass  < 70 Hz      bassReal < 250 Hz
    midReal  250–2000 Hz  highReal > 11000 Hz
    subBassDepth = 40 Hz vs 70 Hz,  highPitch = 19000 Hz vs 11000 Hz
    bassHardness = how fast subBass rises
  The only web difference: samples come from a Web Audio AnalyserNode
  instead of ofSoundStream callbacks.
*/
export type Bands = {
    subBass: number; subBassDepth: number; bassReal: number; midReal: number;
    highReal: number; highPitch: number; bassHardness: number;
};

const BUFFER = 512;
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

export class AudioAnalyzer {
    readonly input: AnalyserNode;
    private win: Float32Array<ArrayBuffer>;
    private sr: number;
    private v: Bands = { subBass: 0, subBassDepth: 0, bassReal: 0, midReal: 0, highReal: 0, highPitch: 0, bassHardness: 0 };
    private prevSubBass = 0;
    // filter states survive between frames (otherwise clicks at the buffer edges)
    private s = { subLP: 0, subDeepLP: 0, bassLP: 0, midHP: 0, midHPin: 0, midLP: 0, highHP: 0, highHPin: 0, vHighHP: 0, vHighHPin: 0 };

    constructor(ctx: AudioContext) {
        this.input = ctx.createAnalyser();
        this.input.fftSize = BUFFER;
        this.win = new Float32Array(BUFFER);
        this.sr = ctx.sampleRate;
    }

    reset() {
        this.v = { subBass: 0, subBassDepth: 0, bassReal: 0, midReal: 0, highReal: 0, highPitch: 0, bassHardness: 0 };
        this.prevSubBass = 0;
        for (const k of Object.keys(this.s) as (keyof typeof this.s)[]) this.s[k] = 0;
    }

    private lpA(hz: number) { const RC = 1 / (2 * Math.PI * hz), dt = 1 / this.sr; return dt / (RC + dt); }
    private hpA(hz: number) { const RC = 1 / (2 * Math.PI * hz), dt = 1 / this.sr; return RC / (RC + dt); }

    update(): Bands {
        this.input.getFloatTimeDomainData(this.win);
        const w = this.win, s = this.s;
        const aSub = this.lpA(70), aDeep = this.lpA(40), aBass = this.lpA(250);
        const aMidHP = this.hpA(250), aMidLP = this.lpA(2000), aHigh = this.hpA(11000), aVHigh = this.hpA(19000);
        let sb = 0, sbd = 0, br = 0, mr = 0, hr = 0, vhr = 0;
        for (let i = 0; i < BUFFER; i++) {
            const x = w[i];
            s.subLP += aSub * (x - s.subLP); sb += s.subLP * s.subLP;
            s.subDeepLP += aDeep * (x - s.subDeepLP); sbd += s.subDeepLP * s.subDeepLP;
            s.bassLP += aBass * (x - s.bassLP); br += s.bassLP * s.bassLP;
            s.midHP = aMidHP * (s.midHP + x - s.midHPin); s.midHPin = x;
            s.midLP += aMidLP * (s.midHP - s.midLP); mr += s.midLP * s.midLP;
            s.highHP = aHigh * (s.highHP + x - s.highHPin); s.highHPin = x; hr += s.highHP * s.highHP;
            s.vHighHP = aVHigh * (s.vHighHP + x - s.vHighHPin); s.vHighHPin = x; vhr += s.vHighHP * s.vHighHP;
        }
        const rms = (sum: number) => Math.sqrt(sum / BUFFER);
        const [SB, SBD, BR, MR, HR, VHR] = [sb, sbd, br, mr, hr, vhr].map(rms);
        const v = this.v;
        v.subBass = v.subBass * 0.8 + clamp(SB * 25, 0, 1) * 0.2;
        v.bassReal = v.bassReal * 0.75 + clamp(BR * 14, 0, 1) * 0.25;
        v.midReal = v.midReal * 0.75 + clamp(MR * 18, 0, 1) * 0.25;
        v.highReal = v.highReal * 0.75 + clamp(HR * 20, 0, 1) * 0.25;
        v.subBassDepth = v.subBassDepth * 0.9 + clamp(SBD / (SB + 0.0001), 0, 1) * 0.1;
        v.highPitch = v.highPitch * 0.9 + clamp(VHR / (HR + 0.0001), 0, 1) * 0.1;
        v.bassHardness = v.bassHardness * 0.7 + clamp((v.subBass - this.prevSubBass) * 8, 0, 1) * 0.3;
        this.prevSubBass = v.subBass;
        return v;
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
    let next = ctx.currentTime + 0.05, step = 0;
    const schedule = () => {
        while (next < ctx.currentTime + 0.2) {
            const t = next, sixteenth = step % 4, bar = Math.floor(step / 16) % 4;
            if (sixteenth === 0) {
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.frequency.setValueAtTime(140, t); o.frequency.exponentialRampToValueAtTime(42, t + 0.12);
                g.gain.setValueAtTime(1, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
                o.connect(g).connect(master); o.start(t); o.stop(t + 0.4);
            }
            if (sixteenth === 2) {
                const n = ctx.createBufferSource(), hp = ctx.createBiquadFilter(), g = ctx.createGain();
                n.buffer = noiseBuf; hp.type = "highpass"; hp.frequency.value = 9000;
                g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.07);
                n.connect(hp).connect(g).connect(master); n.start(t); n.stop(t + 0.08);
            }
            if (step % 2 === 1 && bar !== 3) {
                const o = ctx.createOscillator(), lp = ctx.createBiquadFilter(), g = ctx.createGain();
                o.type = "sawtooth"; o.frequency.value = notes[(step >> 1) % notes.length];
                lp.type = "lowpass"; lp.frequency.value = 1800;
                g.gain.setValueAtTime(0.14, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
                o.connect(lp).connect(g).connect(master); o.start(t); o.stop(t + 0.2);
            }
            if (sixteenth === 0 && step % 8 === 0) {
                const o = ctx.createOscillator(), g = ctx.createGain();
                o.type = "sine"; o.frequency.value = bar % 2 ? 49 : 55;
                g.gain.setValueAtTime(0.5, t); g.gain.exponentialRampToValueAtTime(0.001, t + beat * 1.8);
                o.connect(g).connect(master); o.start(t); o.stop(t + beat * 2);
            }
            next += beat / 4; step++;
        }
    };
    schedule();
    const id = setInterval(schedule, 50);
    return () => { clearInterval(id); master.disconnect(); };
};
