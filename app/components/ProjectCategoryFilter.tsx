"use client";

import { useState } from 'react';
import type { ProjectMetadata } from '@/app/(routes)/projects/projects';
import ProjectCard from './ProjectCard';

type ProjectCategoryFilterProps = {
    projects: ProjectMetadata[];  // metadata-only — Component is stripped before crossing the server/client boundary
    categories: string[];  // deduplicated list from projects.ts
};

const ProjectCategoryFilter = ({ projects, categories }: ProjectCategoryFilterProps) => {
    // activeCategory is the currently selected filter — 'All' shows every project
    const [activeCategory, setActiveCategory] = useState('All');

    const filtered = activeCategory === 'All'
        ? projects
        : projects.filter((p) => p.category.includes(activeCategory));

    return (
        <>
            {/* One button per category */}
            <div className="flex flex-wrap gap-2 mb-8">
                {categories.map((cat) => (
                    <button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        className={`px-4 py-1 rounded-full text-sm border transition-colors ${
                            activeCategory === cat
                                ? 'bg-neutral-900 text-white border-neutral-900'
                                : 'bg-white text-neutral-700 border-neutral-300 hover:border-neutral-600'
                        }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Filtered project grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 sm:gap-12">
                {filtered.map((project) => (
                    <ProjectCard key={project.slug} project={project} />
                ))}
            </div>
        </>
    );
};

export default ProjectCategoryFilter;
