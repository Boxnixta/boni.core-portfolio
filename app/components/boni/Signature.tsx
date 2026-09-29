import Link from "next/link";

/* Hand-drawn signature, fixed bottom left, wiggles on hover. Hidden on small screens. */
const Signature = () => (
    <Link href="/" className="signature" aria-label="Bonita von Gizycki – home">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/brand/signature.webp" alt="" />
    </Link>
);

export default Signature;
