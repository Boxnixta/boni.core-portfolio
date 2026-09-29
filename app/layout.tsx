import "./globals.css"; // Import global styles so they apply everywhere
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import CursorLayer from "@/app/components/boni/CursorLayer";
import Signature from "@/app/components/boni/Signature";
import { Inter, Playfair_Display, Pixelify_Sans, Great_Vibes } from "next/font/google";

/*
  Every font is exposed as a CSS variable (--font-…) on <html>.
  globals.css maps them to Tailwind classes: font-pixel, font-script.
  display: "swap" shows a fallback font immediately, then swaps in the web font.
*/
const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

// subsets is required: Next.js preloads the font and must know which character set to fetch
const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair", display: "swap" });

// Pixel font for accents (headings, nav, hint text) — from the old three.js portfolio
const pixelify = Pixelify_Sans({ subsets: ["latin"], variable: "--font-pixelify", display: "swap" });

// Script font for single letters / highlights — like "Bachelorarbeit" in the Readymag portfolio
const greatVibes = Great_Vibes({ subsets: ["latin"], weight: "400", variable: "--font-great-vibes", display: "swap" });

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html
            lang="en"
            className={`${inter.variable} ${playfair.variable} ${pixelify.variable} ${greatVibes.variable}`}
        >
            <body className="flex flex-col min-h-screen">
                <Header />

                <main className="flex-grow w-full">
                    {/* Centered content container — the landing section breaks out of it on purpose */}
                    <div className="mx-auto px-4 sm:px-6 lg:px-8 max-w-[min(90vw,1600px)]">
                        {children}
                    </div>
                </main>

                <Footer />

                {/* Decorative layers: signature bottom left, pixel sprite + star following the cursor */}
                <Signature />
                <CursorLayer />
            </body>
        </html>
    );
}
