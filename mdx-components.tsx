import type { MDXComponents } from 'mdx/types';

// components: the default renderers MDX uses for each Markdown element
export function useMDXComponents(components: MDXComponents): MDXComponents {
    return {
        ...components, // keep all defaults
        // Override specific elements when needed, for example:
        // h2: (props) => <h2 className="text-2xl font-bold mt-8" {...props} />
    };
}
