"use client";

import { ReactNode } from "react";

// Props this component receives from its parent (AccordionAbout)
type AccordionEntryProps = {
    title: string;
    index: number;                     // this entry's position in the list
    openIndex: number | null;          // which index the parent says is open (null = none)
    onToggle: (index: number) => void; // callback: report back to the parent when clicked
    children: ReactNode;               // the MDX content rendered inside
};

// AccordionEntry is a controlled component — it does not track its own open/closed state.
// The parent (AccordionAbout) owns the state and passes it down via openIndex.
const AccordionEntry = ({ title, index, openIndex, onToggle, children }: AccordionEntryProps) => {

    // This entry is open when its own index matches the one the parent says is open
    const isOpen = openIndex === index;

    return (
        <div className="border-b border-gray-300">

            {/* Clicking the button reports this entry's index back to the parent via onToggle */}
            <button
                onClick={() => onToggle(index)}
                className={
                    "w-full flex justify-between items-center py-3 px-4 transition-colors " +
                    (isOpen
                        ? "bg-gray-100 font-medium rounded-t-sm border-b border-gray-300"
                        : "bg-transparent hover:bg-gray-50 rounded-sm")
                }
            >
                <span>{title}</span>
                {/* Minus when open, plus when closed */}
                <span className="text-2xl leading-none">{isOpen ? "−" : "+"}</span>
            </button>

            {/*
              && short-circuit: the article only exists in the DOM when isOpen is true.
              Unlike CSS display:none, the content is completely absent when closed.
            */}
            {isOpen && (
                /*
                  prose: restores heading sizes, list bullets, and paragraph spacing
                         that Tailwind's reset stripped from the Markdown-rendered HTML.
                  about-table: our custom class for responsive table layout (added in 9.3.7).
                  [&_tr]:border-gray-300: Tailwind arbitrary variant — targets <tr> elements
                         inside this article without writing a separate CSS rule.
                  prose-*: modifier classes that fine-tune prose font sizes and spacing.
                */
                <article className="
                    about-table
                    [&_tr:last-child]:border-b [&_tr]:border-gray-300
                    prose prose-neutral max-w-none py-3 px-4 bg-gray-50 rounded-b-lg
                    prose-p:text-sm prose-p:leading-snug prose-p:max-w-none
                    prose-li:text-sm prose-li:leading-snug
                    prose-h2:text-base prose-h3:text-base
                    prose-h2:mt-10 prose-h3:mt-8
                    hyphens-auto pb-12
                ">
                    {children}
                </article>
            )}

        </div>
    );
};

export default AccordionEntry;
