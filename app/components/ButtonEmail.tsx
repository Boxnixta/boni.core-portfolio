import type { ReactNode } from "react";
// "import type" marks this as a type-only import — stripped entirely at
// compile time, never included in the JavaScript bundle.

type ButtonEmailProps = {
    email: string;
    subject?: string;     // optional: pre-filled subject line
    className?: string;   // allows callers to add Tailwind classes
    children?: ReactNode; // the label shown inside the button
};

/*
  Builds a mailto: URL.
  encodeURIComponent encodes spaces and special characters so the URL is valid:
  "Hello from the website" → "Hello%20from%20the%20website".
*/
function buildMailto(email: string, subject?: string) {
    if (!subject) return `mailto:${email}`;
    return `mailto:${email}?subject=${encodeURIComponent(subject)}`;
}

export function ButtonEmail({
    email,
    subject,
    className,
    children = "Kontakt", // default label if none is passed
}: ButtonEmailProps) {
    const href = buildMailto(email, subject);

    return (
        <a
            href={href}
            className={className}
            aria-label={`Email ${email}`}
        >
            {children}
        </a>
    );
}
