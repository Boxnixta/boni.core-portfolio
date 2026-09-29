import Image from 'next/image';
import Link from 'next/link';
import type { ProjectMetadata } from '@/app/(routes)/projects/projects';

// Receives a full Project object and renders one card
const ProjectCard = ({ project }: { project: ProjectMetadata }) => {
    return (
        <div className="flex flex-col gap-3">
            {/* Thumbnail image — wrapped in Link so clicking it navigates to the detail page */}
            <Link href={`/projects/${project.slug}`}>
                <div className="relative aspect-3/2 w-full overflow-hidden rounded-sm bg-gray-100">
                    {/*
                      aspect-3/2: locks the container to a 3:2 aspect ratio.
                      relative + fill: the Image expands to fill the container exactly.
                      overflow-hidden: clips the image to the rounded corners.
                      bg-gray-100: placeholder colour shown while the image loads.
                    */}
                    <Image
                        src={project.thumbnail}
                        alt={project.thumbnailAlt}
                        fill
                        className="object-cover transition-opacity hover:opacity-80"
                    />
                </div>
            </Link>

            {/* Short description from the data layer */}
            <p className="text-sm leading-snug max-w-none">
                {project.description}
            </p>

            {/* Link to the detail page — slug becomes the URL segment */}
            <Link
                href={`/projects/${project.slug}`}
                className="text-sm font-medium hover:text-gray-400 transition-colors"
            >
                → {project.title}
            </Link>
        </div>
    );
};

export default ProjectCard;
