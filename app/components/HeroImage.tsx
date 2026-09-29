import Image from "next/image";

type HeroImageProps = {
    src: string;
    alt: string;
    priority?: boolean;
};

const HeroImage = ({ src, alt, priority = false }: HeroImageProps) => {
    return (
        <Image
            src={src}
            alt={alt}
            fill
            priority={priority}
            className="object-cover"
        />
    );
};

export default HeroImage;
