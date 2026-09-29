// openFrameworks-style HSB (all channels 0–255), so the colour maths matches ofColor
export type RGBA = [number, number, number, number];

export const toHsb = ([r, g, b]: RGBA): [number, number, number] => {
    const max = Math.max(r, g, b), min = Math.min(r, g, b), d = max - min;
    let h = 0;
    if (d !== 0) {
        if (max === r) h = ((g - b) / d) % 6;
        else if (max === g) h = (b - r) / d + 2;
        else h = (r - g) / d + 4;
        h = (h * 255) / 6;
        if (h < 0) h += 255;
    }
    return [h, max === 0 ? 0 : (d / max) * 255, max];
};

export const fromHsb = (h: number, s: number, v: number, a: number): RGBA => {
    const hh = (((h % 255) + 255) % 255) / 255 * 6, ss = s / 255;
    const i = Math.floor(hh), f = hh - i;
    const p = v * (1 - ss), q = v * (1 - ss * f), t = v * (1 - ss * (1 - f));
    const [r, g, b] = [[v, t, p], [q, v, p], [p, v, t], [p, q, v], [t, p, v], [v, p, q]][i % 6];
    return [r, g, b, a];
};

export const lerpColor = (c: RGBA, o: RGBA, t: number): RGBA =>
    [c[0] + (o[0] - c[0]) * t, c[1] + (o[1] - c[1]) * t, c[2] + (o[2] - c[2]) * t, c[3] + (o[3] - c[3]) * t];

export const css = (c: RGBA, alpha = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${alpha})`;
