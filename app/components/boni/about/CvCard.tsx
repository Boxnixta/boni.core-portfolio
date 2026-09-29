/* White card with a glowing label on the left and a list of CV entries (Readymag style) */
export type CvEntry = { title: string; detail: string; sub?: boolean };

const CvCard = ({ label, entries }: { label: string; entries: CvEntry[] }) => (
    <section className="cv-card">
        <h2 className="cv-card-label">{label}</h2>
        <ul className="cv-card-list">
            {entries.map((e) => (
                <li key={e.title} className={e.sub ? "pl-6" : ""}>
                    <strong>{e.title}</strong> – {e.detail}
                </li>
            ))}
        </ul>
    </section>
);

export default CvCard;
