import Link from "next/link";

/* Hand-drawn signature, fixed bottom left, wiggles on hover, links to the contact page. Hidden on small screens. */
const Signature = () => (
    <Link href="/contact" className="signature" aria-label="Contact Bonita von Gizycki">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/img/brand/signature.webp" alt="" />
    </Link>
);

export default Signature;
