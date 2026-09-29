import FancyText from "@/app/components/boni/FancyText";

// Used by HeroSectionText and the page titles — every big heading gets the fancy letter mix
const HeroTitle = ({ text }: { text: string }) => {
    return (
        <div className="relative w-full">
            <h1 className="text-left text-balance">
                <FancyText text={text} />
            </h1>
        </div>
    );
};

export default HeroTitle;
