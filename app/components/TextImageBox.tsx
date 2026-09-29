import Image from "next/image";
import { ReactNode } from "react";

// Export the type so HeroSectionTextImage can reuse it
export type TextImageProps = {
    text: string;
    src: string;
    alt: string;
    priority?: boolean; // set true when this image is the LCP element
    children?: ReactNode; // optional content rendered below the text, still beside the image
};

/*
  Float-based image + text layout.
  On md+ screens the image floats left and text fills the space to its right.
  On small screens the float is not applied — the image sits above the text.
*/
const TextImageBox = ({ text, src, alt, priority = false, children }: TextImageProps) => {
    return (
        <section className="overflow-hidden">
            {/* Float the image left on md+ screens, stack on mobile */}
            {/* overflow-hidden creates a block formatting context that contains the float */}
            <div className="md:float-left md:mr-12 mb-6 md:w-[300px] lg:w-[380px]">
                <Image
                    src={src}
                    alt={alt}
                    width={800}   // source image resolution (not display size)
                    height={800}
                    className="w-full h-auto object-cover rounded-sm"
                    priority={priority}
                />
            </div>
            <p className="p-2 md:max-w-[70ch] xl:max-w-[100ch]">{text}</p>
            {children}
        </section>
    );
};

export default TextImageBox;
