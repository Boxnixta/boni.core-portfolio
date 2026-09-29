import Image from 'next/image';
import Link from 'next/link';
import type { ProjectMetadata } from '@/app/(routes)/projects/projects';

// One project card. Hovering the image shows a blue glow/blur behind it (.project-card-media in boni.css)
const ProjectCard = ({ project }: { project: ProjectMetadata }) => {
    return (
        <div className="flex flex-col gap-3">
            <Link href={`/projects/${project.slug}`} className="project-card-media" aria-label={project.title}>
                <div className="relative aspect-3/2 w-full overflow-hidden rounded-lg bg-gray-100">
                    <Image
                        src={project.thumbnail}
                        alt={project.thumbnailAlt}
                        fill
                        className="object-cover"
                    />
                </div>
            </Link>

            <p className="text-sm leading-snug max-w-none">
                {project.description}
            </p>

            <Link
                href={`/projects/${project.slug}`}
                className="text-sm font-medium hover:text-boni-violet transition-colors"
            >
                → {project.title}
            </Link>
        </div>
    );
};

export default ProjectCard;
