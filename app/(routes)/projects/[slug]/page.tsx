import { notFound } from 'next/navigation';
import TextImageBox from '@/app/components/TextImageBox';
import ProjectImageGallery from '@/app/components/ProjectImageGallery';
import { projects } from '../projects';

/*
  generateStaticParams tells Next.js which [slug] values exist at build time.
  With output: "export", every page must be pre-generated — there is no server
  to handle unknown routes at runtime. This function provides the complete list.
*/
export function generateStaticParams() {
    return projects.map((p) => ({ slug: p.slug }));
}

// In Next.js 15+, params is a Promise — the component must be async to await it
type Props = { params: Promise<{ slug: string }> };

const ProjectPage = async ({ params }: Props) => {
    const { slug } = await params;

    // Find the matching project — show 404 if the slug does not exist
    const project = projects.find((p) => p.slug === slug);
    if (!project) notFound();
    /*
      notFound() throws a special Next.js error that renders the nearest
      not-found.tsx (or the default 404 page). It never returns — TypeScript
      knows project is non-null after this point.
    */

    // Component comes directly from the project object — no separate contentMap needed
    const { Component } = project;

    return (
        <>
            {/* Page title */}
            <section className="relative w-full text-center">
                <h1 className="text-center text-balance">{project.title}</h1>
            </section>

            <TextImageBox
                text={project.introText}
                src={project.introImage}
                alt={project.introImageAlt}
            />

            {/*
              MDX body — wrapped in a prose container so Tailwind's typography
              plugin restores heading sizes, list bullets, and paragraph spacing.
              pt-0 removes the top padding that the global section rule adds,
              keeping the article close to the TextImageBox above it.
            */}
            <section className="pt-0">
                <article className="
                    prose prose-neutral max-w-none
                    prose-p:text-base prose-p:leading-relaxed
                    prose-h2:text-xl prose-h2:font-semibold prose-h2:mt-10 prose-h2:mb-3
                    prose-h3:text-base prose-h3:mt-8
                    hyphens-auto
                ">
                    <Component />
                </article>
            </section>

            {/* Asymmetric four-image gallery from the galleryImages data */}
            <ProjectImageGallery images={project.galleryImages} />
        </>
    );
};

export default ProjectPage;
