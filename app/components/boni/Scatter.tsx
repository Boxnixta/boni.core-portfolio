import Draggable from "./Draggable";

/*
  Loose illustrations lying around on the page, no grid.
  Positions and rotations come from a fixed seed, so the layout looks random
  but is the same on every visit. Each piece can be picked up and moved.
  On phones they are simply stacked.
*/
const rand = (seed: number) => {
    const x = Math.sin(seed * 9301 + 49297) * 233280;
    return x - Math.floor(x);
};

/* eslint-disable @next/next/no-img-element */
const Scatter = ({ items, height = 900, seed = 3 }: { items: { src: string; alt?: string; width?: number }[]; height?: number; seed?: number }) => (
    <div className="scatter not-prose" style={{ ["--scatter-h" as string]: `${height}px` }}>
        {items.map((it, i) => {
            const cols = Math.min(3, items.length);
            const col = i % cols, row = Math.floor(i / cols), rows = Math.ceil(items.length / cols);
            const left = (col / cols) * 100 + rand(seed + i) * (60 / cols);
            const top = (row / rows) * 100 + rand(seed + i * 7) * (40 / rows);
            const rot = (rand(seed + i * 13) - 0.5) * 24;
            return (
                <div
                    key={it.src}
                    className="scatter-pos"
                    style={{ ["--l" as string]: `${Math.min(left, 72)}%`, ["--t" as string]: `${Math.min(top, 78)}%`, ["--r" as string]: `${rot}deg`, ["--w" as string]: `${it.width ?? 30}%` }}
                >
                    <Draggable className="scatter-item">
                        <img src={it.src} alt={it.alt ?? ""} draggable={false} />
                    </Draggable>
                </div>
            );
        })}
    </div>
);

export default Scatter;
