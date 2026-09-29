// page.tsx is the component rendered at the route /.
// const defines an arrow function component named Home.
// It receives no props (no data from outside).
// It returns JSX — the markup that React renders to HTML.

import HeroSectionText from "@/app/components/HeroSectionText";
import HeroImage from "@/app/components/HeroImage";
import HeroCanvas from "@/app/components/HeroCanvas";

const Home = () => {
    return (
        <>
            <div className="content-center py-4 sm:py-6 lg:py-10">
                <p className="intro">(*ᴗ͈ˬᴗ͈)ꕤ*.ﾟ• Designer und Creative Technologist •.*⋆༺☆⋆ﾟ</p>
            </div>

            <HeroCanvas>
                <HeroImage
                    src="/img/home/home-hero.jpg"
                    alt="[Coverartwork for Hannes Hannsen]"
                    priority
                />
            </HeroCanvas>

            <HeroSectionText
                title="Portfoliooo"
                text="2D/3D Design | Motion | Coding | UX/UI | Generative Visuals & Sound"
            />
            
        </>
    );
};

export default Home;
