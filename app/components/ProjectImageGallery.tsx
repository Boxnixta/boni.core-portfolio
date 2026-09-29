import Image from 'next/image';

type GalleryImage = { src: string; alt: string };

const ProjectImageGallery = ({ images }: { images: GalleryImage[] }) => {
    if (images.length < 4) return null;

    return (
        <section>
            {/*
              Mobile: single column stack — each image fills full width at a 3:2 ratio.
              The asymmetric grid cannot be expressed responsively via inline styles,
              so we use two separate containers toggled by breakpoint.
            */}
            <div className="grid grid-cols-1 gap-2 sm:hidden">
                {images.map((img, i) => (
                    <div key={i} className="relative aspect-3/2 overflow-hidden rounded-sm bg-gray-100">
                        <Image src={img.src} alt={img.alt} fill className="object-cover" />
                    </div>
                ))}
            </div>

            {/*
              sm+: asymmetric grid.
              The column ratio (2fr 3fr 3fr) cannot be expressed with Tailwind utility
              classes, so we set it via inline style.
            */}
            <div
                className="hidden sm:grid gap-4"
                style={{ gridTemplateColumns: '2fr 3fr 3fr' }}
            >
                {/* Column 1 — row-span-2 makes this cell tall, spanning both rows */}
                <div className="relative row-span-2 overflow-hidden rounded-sm bg-gray-100">
                    <Image src={images[0].src} alt={images[0].alt} fill className="object-cover" />
                </div>

                {/* Columns 2–3, row 1 — col-span-2 stretches across both remaining columns */}
                <div className="relative col-span-2 overflow-hidden rounded-sm bg-gray-100">
                    <Image src={images[1].src} alt={images[1].alt} fill className="object-cover" />
                </div>

                {/* Column 2, row 2 */}
                <div className="relative overflow-hidden rounded-sm bg-gray-100">
                    <Image src={images[2].src} alt={images[2].alt} fill className="object-cover" />
                </div>

                {/* Column 3, row 2 */}
                <div className="relative overflow-hidden rounded-sm bg-gray-100">
                    <Image src={images[3].src} alt={images[3].alt} fill className="object-cover" />
                </div>
            </div>
        </section>
    );
};

export default ProjectImageGallery;
