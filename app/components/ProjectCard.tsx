import Image from 'next/image';
import Link from 'next/link';
import HoverVideo from '@/app/components/boni/HoverVideo';
import type { ProjectMetadata } from '@/app/(routes)/projects/projects';

// One project card. Hovering the image shows a blue glow/blur behind it (.project-card-media in boni.css)
const ProjectCard = ({ project }: { project: ProjectMetadata }) => {
    return (
        <div className="flex flex-col gap-3">
            <Link href={`/projects/${project.slug}`} className="project-card-media" aria-label={project.title}>
                <div className="relative aspect-3/2 w-full overflow-hidden rounded-lg bg-white">
                    {/* optional thumbnailVideo in the .mdx metadata: short muted loop instead of the still.
                        thumbnailVideoOnHover: true → the still stays, the film only plays on hover */}
                    {project.thumbnailVideo && !project.thumbnailVideoOnHover ? (
                        <HoverVideo
                            src={project.thumbnailVideo}
                            poster={project.thumbnail}
                            label={project.thumbnailAlt}
                            className="absolute inset-0 h-full w-full object-cover"
                            style={project.thumbnailPosition ? { objectPosition: project.thumbnailPosition } : undefined}
                        />
                    ) : (
                    <Image
                        src={project.thumbnail}
                        alt={project.thumbnailAlt}
                        fill
                        // optional per project in the .mdx metadata:
                        // thumbnailFit: "contain" → whole image visible, white bars top/bottom
                        // thumbnailPosition: "15% 50%" → which part stays visible when cropped
                        className={project.thumbnailFit === "contain" ? "object-contain bg-white" : "object-cover"}
                        style={project.thumbnailPosition ? { objectPosition: project.thumbnailPosition } : undefined}
                    />
                    )}
                    {project.thumbnailVideo && project.thumbnailVideoOnHover && (
                        <HoverVideo
                            hoverOnly
                            src={project.thumbnailVideo}
                            poster={project.thumbnail}
                            label={project.thumbnailAlt}
                            className="absolute inset-0 h-full w-full object-cover"
                        />
                    )}
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
