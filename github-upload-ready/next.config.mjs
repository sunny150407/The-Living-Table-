/** @type {import('next').NextConfig} */
// Static export: the site becomes plain files in the "out" folder, which works on Netlify (Git deploy or drag-and-drop), Vercel, GitHub Pages, etc.
// GitHub Pages serves the site from /The-Living-Table-/, so that build sets PAGES_BASE_PATH; everything else builds at the root.
const nextConfig = { output: "export", images: { unoptimized: true }, basePath: process.env.PAGES_BASE_PATH || "" };
export default nextConfig;
