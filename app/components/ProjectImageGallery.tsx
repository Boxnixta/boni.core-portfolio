import Image from 'next/image';

type GalleryImage = { src: string; alt: string };

/*
  Asymmetric four-image gallery.
  Fix: the grid rows now have a real height. Before, every cell only contained
  an absolutely positioned <Image fill>, so the rows collapsed to ~0px and
  you only saw a thin sliver of an image.
  With fewer than 4 images (e.g. galleryImages: []) nothing is rendered.
*/
const ProjectImageGallery = ({ images }: { images: GalleryImage[] }) => {
    if (images.length < 4) return null;

    return (
        <section>
            {/* Mobile: single column, each image 3:2 */}
            <div className="grid grid-cols-1 gap-2 sm:hidden">
                {images.map((img, i) => (
                    <div key={i} className="relative aspect-3/2 overflow-hidden rounded-lg bg-gray-100">
                        <Image src={img.src} alt={img.alt} fill className="object-cover" />
                    </div>
                ))}
            </div>

            {/* sm+: asymmetric grid with fixed row heights */}
            <div
                className="hidden sm:grid gap-4"
                style={{
                    gridTemplateColumns: '2fr 3fr 3fr',
                    gridTemplateRows: 'repeat(2, clamp(180px, 22vw, 360px))',
                }}
            >
                <div className="relative row-span-2 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={images[0].src} alt={images[0].alt} fill className="object-cover" />
                </div>
                <div className="relative col-span-2 overflow-hidden rounded-lg bg-gray-100">
                    <Image src={images[1].src} alt={images[1].alt} fill className="object-cover" />
                </div>
                <div className="relative overflow-hidden rounded-lg bg-gray-100">
                    <Image src={images[2].src} alt={images[2].alt} fill className="object-cover" />
                </div>
                <div className="relative overflow-hidden rounded-lg bg-gray-100">
                    <Image src={images[3].src} alt={images[3].alt} fill className="object-cover" />
                </div>
            </div>
        </section>
    );
};

export default ProjectImageGallery;
