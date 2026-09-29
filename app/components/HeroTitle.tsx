import Image from "next/image";

type HeroImageProps = {
    src: string;
    alt: string;
    priority?: boolean;
};

const HeroTitle = ({ text }: { text: string }) => {
    return (
        <div className="relative w-full">
            <h1 className="text-left text-balance">{text}</h1>
        </div>
    );
};

export default HeroTitle;