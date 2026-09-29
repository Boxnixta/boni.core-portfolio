import HeroTitle from '@/app/components/HeroTitle';
import { projects, categories } from './projects';
import ProjectCategoryFilter from '@/app/components/ProjectCategoryFilter';

// Server Component — reads project data at build time, passes it to the client filter
const Projects = () => {
    /*
      Strip the Component field before passing to the Client Component.
      Functions cannot cross the server/client boundary — only plain serialisable
      data can. ProjectCategoryFilter and ProjectCard only need metadata fields.
    */
    const projectMeta = projects.map(({ Component: _, ...meta }) => meta);

    return (
        <>
            <section className="relative w-full">
                <HeroTitle text="Projects" />
            </section>
            <section className="px-4 py-8">
                <ProjectCategoryFilter projects={projectMeta} categories={categories} />
            </section>
        </>
    );
};

export default Projects;
