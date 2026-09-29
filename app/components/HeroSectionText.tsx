import HeroTitle from "./HeroTitle";

type HeroSectionTextProps = {
    title: string;
    text: string;
};

const HeroSectionText = ({ title, text }: HeroSectionTextProps) => {
    return (
        <section className="relative w-full">
            <HeroTitle text={title} />
            <div className="content-center">
                <p>{text}</p>
            </div>
        </section>
    );
};

export default HeroSectionText;
