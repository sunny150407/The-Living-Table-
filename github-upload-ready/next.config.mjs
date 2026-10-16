/** @type {import('next').NextConfig} */
// Static export: the site becomes plain files in the "out" folder, which works on Netlify (Git deploy or drag-and-drop), Vercel, GitHub Pages, etc.
const nextConfig = { output: "export", images: { unoptimized: true } };
export default nextConfig;
