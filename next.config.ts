import createMDX from "@next/mdx";
import type { NextConfig } from "next";

const withMDX = createMDX({});

const nextConfig: NextConfig = {
    reactStrictMode: true,

    // output: "export", // ← kommentiert für dev, später aktivieren!

    pageExtensions: ["js", "jsx", "ts", "tsx", "md", "mdx"],

    images: {
        unoptimized: true,
    },
};

export default withMDX(nextConfig);