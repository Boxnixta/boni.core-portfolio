import Link from "next/link";
import HeroSectionText from "@/app/components/HeroSectionText";
import ProjectCard from "@/app/components/ProjectCard";
import DeskItems from "@/app/components/boni/DeskItems";
import HintText from "@/app/components/boni/HintText";
import FancyText from "@/app/components/boni/FancyText";
import { projects } from "@/app/(routes)/projects/projects";

const Home = () => {
    // The first six projects in projects.ts are shown as a teaser
    const featured = projects.slice(0, 6);

    return (
        <>
            {/* Landing: full-width desk that breaks out of the centered layout container */}
            <section className="landing-desk">
                <HintText />

                <div className="landing-intro">
                    <p>Hi, I&apos;m Bonita von Gizycki</p>
                    <p>Designer &amp; Creative Technologist</p>
                    <p>⋆ ✩ ‧ ༺☆ ⋆ . ˚ ✮ ˚ . ⋆ ☆༻ ‧ ✩ ⋆</p>
                    <p>2D &amp; 3D design, UX/UI &amp; CI,</p>
                    <p>coding, illustration, animation &amp; film.</p>
                    <p>(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ</p>
                </div>

                <DeskItems />
            </section>

            <HeroSectionText
                title="Portfoliooo"
                text="2D/3D Design | Motion | Coding | UX/UI | Generative Visuals & Sound"
            />

            {/* Teaser grid */}
            <section>
                <h2 className="glow-blue mb-6 sm:mb-10">
                    <FancyText text="Selected Work" />
                </h2>
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    {featured.map((p) => (
                        <ProjectCard key={p.slug} project={p} />
                    ))}
                </div>
                <div className="mt-10 flex justify-center">
                    <Link href="/projects" className="btn-glow">
                        All projects →
                    </Link>
                </div>
            </section>
        </>
    );
};

export default Home;
