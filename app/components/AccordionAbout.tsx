"use client";

import { useState, type ComponentType } from "react";
import AccordionEntry from "@/app/components/AccordionEntry";

// Import each MDX file as both a React component (default) and its metadata (named)
import Vita, { metadata as vitaMetadata }
    from "@/app/(routes)/about/content/vita.mdx";
import Topics, { metadata as topicsMetadata }
    from "@/app/(routes)/about/content/topics.mdx";
import Grants, { metadata as grantsMetadata }
    from "@/app/(routes)/about/content/grants.mdx";
import Publications, { metadata as publicationsMetadata }
    from "@/app/(routes)/about/content/publications.mdx";

/*
  Pair each MDX component with its title from the metadata.
  ComponentType is a built-in React type for any valid React component function.
  To add a new CV section: import the .mdx file above and add one entry here.
*/
const sections: Array<{ title: string; Component: ComponentType }> = [
    { title: vitaMetadata.title,         Component: Vita },
    { title: topicsMetadata.title,       Component: Topics },
    { title: grantsMetadata.title,       Component: Grants },
    { title: publicationsMetadata.title, Component: Publications },
];

const AccordionAbout = () => {
    // null = no section open; a number = that section's index is open
    const [openIndex, setOpenIndex] = useState<number | null>(null);

    const toggle = (index: number) => {
        // If the clicked section is already open, close it — otherwise open it
        setOpenIndex(openIndex === index ? null : index);
    };

    return (
        <section className="relative w-full mb-6 px-3 sm:px-6 lg:px-12 text-left">
            {/*
              Map over sections to render one AccordionEntry per item.
              key={index} is required by React to track list items efficiently.
            */}
            {sections.map(({ title, Component }, index) => (
                <AccordionEntry
                    key={index}
                    title={title}
                    index={index}
                    openIndex={openIndex}  // tells this entry whether it is open
                    onToggle={toggle}      // called when the user clicks this entry
                >
                    {/* Render the MDX file as a React component */}
                    <Component />
                </AccordionEntry>
            ))}
        </section>
    );
};

export default AccordionAbout;
