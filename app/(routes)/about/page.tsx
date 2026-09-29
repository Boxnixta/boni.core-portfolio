import Link from "next/link";
import Parallax from "@/app/components/boni/about/Parallax";
import FolderPlayground from "@/app/components/boni/about/FolderPlayground";
import CvCard, { type CvEntry } from "@/app/components/boni/about/CvCard";

const experience: CvEntry[] = [
    { title: "Freelance Designer", detail: "Graphic design, illustration & post-production (Aug 2019 – today)" },
    { title: "Working Student Design", detail: "Reducse UG, Sabine Linhorst (Jul 2022 – Jul 2024)" },
    { title: "Camera Operator", detail: "Offener Kanal Dessau (Apr 2024)" },
    { title: "Content Creator", detail: "Miomorph Kollektiv (Aug 2019 – today)" },
];

const education: CvEntry[] = [
    { title: "Master of Arts, Creative Technologies", detail: "Film University Babelsberg Konrad Wolf (Oct 2025 – today)" },
    { title: "Erasmus", detail: "UAP Poznań (Feb 2022 – Jul 2022)" },
    { title: "Bachelor of Arts, Integrated Design", detail: "Anhalt University of Applied Sciences (Sep 2019 – Feb 2025)" },
    { title: "Deutschlandstipendium", detail: "(Nov 2020 – Jul 2021)", sub: true },
    { title: "Merit scholarship", detail: "(Sep 2023 – Jan 2024)", sub: true },
    { title: "Student council & faculty council", detail: "(Sep 2023 – Aug 2024)", sub: true },
];

const About = () => (
    <div className="about-page">
        {/* ---------- left top: name + sparkles ---------- */}
        <div className="about-sig">
            <Parallax speed={0.08} className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/about/twinklestars.png" alt="" className="about-twinkle" />
                <h1 className="sr-only">Bonita von Gizycki</h1>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/brand/signature.webp" alt="Bonita von Gizycki (signature)" className="about-signature" />
            </Parallax>
        </div>

        {/* ---------- right column: photo cluster, intro, CV ---------- */}
        <div className="about-right">
            <Parallax speed={0.25} max={500} className="about-photo-cluster">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/about/cd.png" alt="" className="about-cd" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/about/CDJ.png" alt="" className="about-cdj" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/about/PictureOfMe.png" alt="Portrait of Bonita" className="about-photo" />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/about/sterne-illu.png" alt="" className="about-stars" />
            </Parallax>

            <div className="hey-heading">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/img/about/hey-spray-illu.png" alt="" className="hey-spray" />
                <h2 className="hey-title">Hellooooo</h2>
            </div>

            <p className="about-intro">
                I&apos;m Bonita and I specialise in graphic design, illustration, 3D design, animation and film. My focus
                is on developing creative, well-thought-out visual solutions – from the first idea to the final
                execution. I&apos;m especially interested in visual storytelling, interactive media and pre- and
                post-production. Thanks to my quick grasp and analytical thinking, I get into new concepts, programs
                and technologies efficiently.
            </p>

            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/img/about/silverheart.png" alt="" className="about-heart" />

            <CvCard label="Experience" entries={experience} />
            <CvCard label="Education" entries={education} />

            <div className="flex justify-center pt-4">
                <Link href="/contact" className="btn-glow">
                    Contact
                </Link>
            </div>
        </div>

        {/* ---------- left bottom (on phones: at the end): folder game ---------- */}
        <div className="about-play">
            <FolderPlayground />
        </div>
    </div>
);

export default About;
