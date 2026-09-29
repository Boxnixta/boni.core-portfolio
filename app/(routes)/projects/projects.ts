import type { ComponentType } from 'react';

// Import each MDX file as both a React component (default) and its metadata (named)
import Project1Component, { metadata as project1Meta }
    from './[slug]/content/project1.mdx';
import Project2Component, { metadata as project2Meta }
    from './[slug]/content/project2.mdx';
import Project3Component, { metadata as project3Meta }
    from './[slug]/content/project3.mdx';

/*
  ProjectMetadata describes the shape of the metadata export in each .mdx file.
  TypeScript cannot infer the full type from MDX exports automatically,
  so we cast each import against this type to get proper type checking.
*/
export type ProjectMetadata = {
    slug: string;
    title: string;
    category: string[];
    /** Path to the 3:2 thumbnail shown on the listing page */
    thumbnail: string;
    thumbnailAlt: string;
    /** Short description shown below the thumbnail */
    description: string;
    /** Intro paragraph shown alongside the intro image on the detail page */
    introText: string;
    introImage: string;
    introImageAlt: string;
    /** Exactly four images for the asymmetric gallery */
    galleryImages: { src: string; alt: string }[];
};

// Project extends ProjectMetadata with the MDX component
export type Project = ProjectMetadata & {
    /** The MDX file rendered as a React component on the detail page */
    Component: ComponentType;
};

/*
  Each project is defined entirely in its MDX file.
  The metadata export provides all structured data; the default export is the component.
  To add a project: create a new .mdx file and add one import and one entry here.
*/
export const projects: Project[] = [
    { ...(project1Meta as ProjectMetadata), Component: Project1Component },
    { ...(project2Meta as ProjectMetadata), Component: Project2Component },
    { ...(project3Meta as ProjectMetadata), Component: Project3Component },
];

/*
  Derive the category list automatically from the projects array.
  Array.from(new Set(...)) removes duplicates.
  'All' is prepended so there is always a "show everything" option.
  This list never needs manual maintenance — it updates when projects change.
*/
export const categories = [
    'All',
    ...Array.from(new Set(projects.flatMap((p) => p.category))),
];
