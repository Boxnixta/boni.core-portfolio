"use client";

import { useState, type ComponentType } from "react";
import AccordionEntry from "@/app/components/AccordionEntry";

import Vita, { metadata as vitaMetadata } from "@/app/(routes)/about/content/vita.mdx";
import Skills, { metadata as skillsMetadata } from "@/app/(routes)/about/content/skills.mdx";
import Engagement, { metadata as engagementMetadata } from "@/app/(routes)/about/content/engagement.mdx";

const sections: Array<{ title: string; Component: ComponentType }> = [
    { title: vitaMetadata.title, Component: Vita },
    { title: skillsMetadata.title, Component: Skills },
    { title: engagementMetadata.title, Component: Engagement },
];

// Only one section open at a time; all closed at the start
const AccordionAbout = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(null);
    const toggle = (index: number) => setOpenIndex(openIndex === index ? null : index);

    return (
        <section className="accordion-about">
            {sections.map(({ title, Component }, index) => (
                <AccordionEntry key={title} title={title} index={index} openIndex={openIndex} onToggle={toggle}>
                    <Component />
                </AccordionEntry>
            ))}
        </section>
    );
};

export default AccordionAbout;
