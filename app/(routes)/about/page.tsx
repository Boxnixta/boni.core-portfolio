import AccordionAbout from "@/app/components/AccordionAbout";
import HeroSectionTextImage from "@/app/components/HeroSectionTextImage";

const About = () => {
    return (
        <>
            {/* Top section: portrait image + introductory text */}
            <HeroSectionTextImage
                title="Boni.Core"
                text="Creative Technologist and Designer exploring the relationship between technology, aesthetics and human experience."
                src="/img/about/portrait.jpg"
                alt="Portrait of Boni.Core"
            />

            {/* CV accordion — content comes from the .mdx files */}
            <AccordionAbout />
        </>
    );
};

export default About;
