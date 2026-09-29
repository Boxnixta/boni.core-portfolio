import type { ComponentType } from 'react';

// Import each MDX file as both a React component (default) and its metadata (named).
// Order here = order on the projects page.
import Cyberdeck, { metadata as cyberdeckMeta } from './[slug]/content/cute-cyberdeck.mdx';
import Grenzen, { metadata as grenzenMeta } from './[slug]/content/grenzen-vr.mdx';
import Entity, { metadata as entityMeta } from './[slug]/content/the-entity.mdx';
import Eora, { metadata as eoraMeta } from './[slug]/content/eora.mdx';
import Blob, { metadata as blobMeta } from './[slug]/content/blob-audio-reactor.mdx';
import Tentacles, { metadata as tentaclesMeta } from './[slug]/content/tentacles.mdx';
import Kusama, { metadata as kusamaMeta } from './[slug]/content/kusama-bubbles.mdx';
import ShaderSketches, { metadata as shaderSketchesMeta } from './[slug]/content/shader-sketches.mdx';
import VrWorkshop, { metadata as vrWorkshopMeta } from './[slug]/content/vr-workshop.mdx';
import BachelorThesis, { metadata as bachelorThesisMeta } from './[slug]/content/bachelor-thesis.mdx';
import Nacht3001, { metadata as nacht3001Meta } from './[slug]/content/3001-nacht-reel.mdx';
import Sneeze, { metadata as sneezeMeta } from './[slug]/content/sneeze-loop.mdx';
import Ethereal, { metadata as etherealMeta } from './[slug]/content/ethereal-modulations.mdx';
import Undine, { metadata as undineMeta } from './[slug]/content/undine.mdx';
import Dmag, { metadata as dmagMeta } from './[slug]/content/d-mag-03.mdx';
import Covers, { metadata as coversMeta } from './[slug]/content/cover-artworks.mdx';
import Events, { metadata as eventsMeta } from './[slug]/content/event-design.mdx';
import Merchant, { metadata as merchantMeta } from './[slug]/content/merchant-of-venice.mdx';
import Nova, { metadata as novaMeta } from './[slug]/content/nova-picture-book.mdx';
import KleinSein, { metadata as kleinSeinMeta } from './[slug]/content/klein-sein-comic.mdx';

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

export type Project = ProjectMetadata & {
    /** The MDX file rendered as a React component on the detail page */
    Component: ComponentType;
};

// To add a project: create a new .mdx file and add one import and one entry here.
export const projects: Project[] = [
    { ...(bachelorThesisMeta as ProjectMetadata), Component: BachelorThesis },
    { ...(etherealMeta as ProjectMetadata), Component: Ethereal },
    { ...(eoraMeta as ProjectMetadata), Component: Eora },
    { ...(kusamaMeta as ProjectMetadata), Component: Kusama },
    { ...(cyberdeckMeta as ProjectMetadata), Component: Cyberdeck },
    { ...(grenzenMeta as ProjectMetadata), Component: Grenzen },
    { ...(entityMeta as ProjectMetadata), Component: Entity },
    { ...(blobMeta as ProjectMetadata), Component: Blob },
    { ...(tentaclesMeta as ProjectMetadata), Component: Tentacles },
    { ...(shaderSketchesMeta as ProjectMetadata), Component: ShaderSketches },
    { ...(vrWorkshopMeta as ProjectMetadata), Component: VrWorkshop },
    { ...(nacht3001Meta as ProjectMetadata), Component: Nacht3001 },
    { ...(sneezeMeta as ProjectMetadata), Component: Sneeze },
    { ...(undineMeta as ProjectMetadata), Component: Undine },
    { ...(dmagMeta as ProjectMetadata), Component: Dmag },
    { ...(coversMeta as ProjectMetadata), Component: Covers },
    { ...(eventsMeta as ProjectMetadata), Component: Events },
    { ...(merchantMeta as ProjectMetadata), Component: Merchant },
    { ...(novaMeta as ProjectMetadata), Component: Nova },
    { ...(kleinSeinMeta as ProjectMetadata), Component: KleinSein },
];

// Category list is derived automatically; 'All' is always first.
export const categories = [
    'All',
    ...Array.from(new Set(projects.flatMap((p) => p.category))),
];
