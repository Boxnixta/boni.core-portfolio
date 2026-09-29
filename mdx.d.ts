declare module "*.mdx" {
    import type { ComponentType } from "react";

    // The default export of any .mdx file is a React component —
    // render it with <Component /> just like any other component.
    const MDXComponent: ComponentType<any>;
    export default MDXComponent;

    // MDX files can also export named values (like metadata).
    // We declare the shape of the metadata object we will use.
    export interface MDXMetadata {
        title: string;
    }

    export const metadata: MDXMetadata;
}
