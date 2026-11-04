import Link from "next/link";
import Parallax from "@/app/components/boni/about/Parallax";
import FolderPlayground from "@/app/components/boni/about/FolderPlayground";
import Draggable from "@/app/components/boni/Draggable";
import AccordionAbout from "@/app/components/AccordionAbout";

/* eslint-disable @next/next/no-img-element */
const About = () => (
    <div className="about-page">
        {/* ---------- left top: big name + sparkles ---------- */}
        <div className="about-sig">
            <Parallax speed={0.08} className="relative">
                <Draggable className="about-twinkle">
                    <img src="/img/about/twinklestars.png" alt="" draggable={false} />
                </Draggable>
                <h1 className="sr-only">Bonita von Gizycki</h1>
                <img src="/img/brand/signature.webp" alt="" className="about-signature" draggable={false} />
            </Parallax>
        </div>

        {/* ---------- right: photo cluster, hello, intro, CV accordion ---------- */}
        <div className="about-right">
            <Parallax speed={0.25} max={500} className="about-photo-cluster">
                <Draggable className="about-cd">
                    <img src="/img/about/cd.png" alt="" draggable={false} />
                </Draggable>
                <Draggable className="about-cdj">
                    <img src="/img/about/CDJ.png" alt="" draggable={false} />
                </Draggable>
                {/* acrylic charm: the outline is a glass layer that blurs + disperses whatever lies behind it */}
                <Draggable className="about-photo" decorative={false} hitMask="/img/about/portrait-glass-mask.png">
                    <span className="about-photo-glass" aria-hidden="true" />
                    <span className="about-photo-light" aria-hidden="true" />
                    <img src="/img/about/portrait.png" alt="Portrait of Bonita" className="about-photo-img" draggable={false} />
                </Draggable>
                <Draggable className="about-stars">
                    <img src="/img/about/sterne-illu.png" alt="" draggable={false} />
                </Draggable>
            </Parallax>

            <div className="hey-heading">
                <img src="/img/about/hey-spray-illu.png" alt="" className="hey-spray" draggable={false} />
                {/* many o's on purpose: the word always runs out of the screen, never wraps */}
                <h2 className="hey-title hello-title">Hellooooooooooooooo</h2>
            </div>

            <p className="about-intro">
                I&apos;m Bonita, a&nbsp;designer and creative technologist based in Potsdam, currently studying Creative
                Technologies at the Film University Babelsberg. I&nbsp;build interactive and audiovisual work where 3D, code
                and sound meet: real-time visuals, VR experiences, generative systems and small hardware builds. My
                roots are in graphic design, branding, illustration and film.
            </p>

            <Draggable className="about-heart">
                <img src="/img/about/silverheart.png" alt="" draggable={false} />
            </Draggable>

            {/* Vita, skills, awards: collapsed until clicked */}
            <AccordionAbout />

            <div className="flex justify-center pt-8">
                <Link href="/contact" className="btn-glow">
                    Contact
                </Link>
            </div>
        </div>

        {/* SVG filter for the portrait glass (prism split of the backdrop, Chromium only) */}
        <svg width="0" height="0" className="absolute" aria-hidden="true">
            <filter id="glass-dispersion" x="0" y="0" width="100%" height="100%" colorInterpolationFilters="sRGB">
                <feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="7" result="noise" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="12" xChannelSelector="R" yChannelSelector="G" result="dr" />
                <feColorMatrix in="dr" type="matrix" values="1 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 1 0" result="r" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="22" xChannelSelector="R" yChannelSelector="G" result="dg" />
                <feColorMatrix in="dg" type="matrix" values="0 0 0 0 0  0 1 0 0 0  0 0 0 0 0  0 0 0 1 0" result="g" />
                <feDisplacementMap in="SourceGraphic" in2="noise" scale="32" xChannelSelector="R" yChannelSelector="G" result="db" />
                <feColorMatrix in="db" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 1 0 0  0 0 0 1 0" result="b" />
                <feBlend in="r" in2="g" mode="screen" result="rg" />
                <feBlend in="rg" in2="b" mode="screen" />
            </filter>
        </svg>

        {/* ---------- left bottom (on phones: at the end): folder game ---------- */}
        <div className="about-play">
            <FolderPlayground />
        </div>
    </div>
);

export default About;
