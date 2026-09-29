"use client";

import { useState } from 'react';
import type { ProjectMetadata } from '@/app/(routes)/projects/projects';
import ProjectCard from './ProjectCard';

type ProjectCategoryFilterProps = {
    projects: ProjectMetadata[];
    categories: string[];
};

// Filter pills in the boni.core button style: pink outline, active = filled pink
const ProjectCategoryFilter = ({ projects, categories }: ProjectCategoryFilterProps) => {
    const [activeCategory, setActiveCategory] = useState('All');

    const filtered = activeCategory === 'All'
        ? projects
        : projects.filter((p) => p.category.includes(activeCategory));

    return (
        <>
            <div className="flex flex-wrap gap-3 mb-10" role="group" aria-label="Filter projects by category">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        type="button"
                        onClick={() => setActiveCategory(cat)}
                        aria-pressed={activeCategory === cat}
                        className={`btn filter-pill ${activeCategory === cat ? 'is-active' : ''}`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                {filtered.map((project) => (
                    <ProjectCard key={project.slug} project={project} />
                ))}
            </div>
        </>
    );
};

export default ProjectCategoryFilter;
