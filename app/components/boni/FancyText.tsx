/*
  Headline style from the old portfolio:
  letter 1 = script, letter 2 = bold grotesk, letters 3–4 = pixel,
  letters 5–6 = script, everything after = the normal heading font.
  e.g. "Scroll" → S(script) c(bold) r o(pixel) l l(script)

  Screen readers read the plain text (sr-only); the styled letters are hidden from them.
*/
const letterClass = (i: number) => {
    if (i === 0 || i === 4 || i === 5) return "fancy-script";
    if (i === 2 || i === 3) return "fancy-pixel";
    return "";
};

const FancyText = ({ text, label }: { text: string; label?: string }) => {
    // count only visible letters, so spaces don't shift the pattern
    let n = -1;
    return (
        <>
        <span className="sr-only">{label ?? text}</span>
        <span aria-hidden="true" className="fancy-text">
            {text.split("").map((ch, i) => {
                if (ch === " ") return <span key={i}>{" "}</span>;
                n++;
                return (
                    <span key={i} className={letterClass(n)}>
                        {ch}
                    </span>
                );
            })}
        </span>
        </>
    );
};

export default FancyText;
