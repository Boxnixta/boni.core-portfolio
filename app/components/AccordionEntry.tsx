"use client";

import { ReactNode } from "react";

type AccordionEntryProps = {
    title: string;
    index: number;
    openIndex: number | null;
    onToggle: (index: number) => void;
    children: ReactNode;
};

// One collapsible section. Content is only rendered while open (tutorial logic), boni.core styling.
const AccordionEntry = ({ title, index, openIndex, onToggle, children }: AccordionEntryProps) => {
    const isOpen = openIndex === index;
    const panelId = `accordion-panel-${index}`;

    return (
        <div className="accordion-entry">
            <button
                type="button"
                onClick={() => onToggle(index)}
                className={`accordion-button ${isOpen ? "is-open" : ""}`}
                aria-expanded={isOpen}
                aria-controls={panelId}
            >
                <span>{title}</span>
                <span className="accordion-icon" aria-hidden="true">{isOpen ? "−" : "+"}</span>
            </button>

            {isOpen && (
                <article
                    id={panelId}
                    className="
                        accordion-panel about-table
                        prose prose-neutral max-w-none
                        prose-p:text-sm prose-p:leading-snug prose-p:max-w-none
                        prose-li:text-sm prose-li:leading-snug
                        prose-h3:text-sm prose-h3:mt-6 prose-h3:mb-2
                        prose-td:text-sm prose-th:text-xs
                        hyphens-auto
                    "
                >
                    {children}
                </article>
            )}
        </div>
    );
};

export default AccordionEntry;
