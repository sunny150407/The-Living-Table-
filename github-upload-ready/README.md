# The Living Table
A searchable digital archive of 500 real Indian recipes across 35 regional cuisines, presented as an editorial food magazine.

## Run locally (Node 18+)
```
npm install
npm run dev                  # http://localhost:3000
npm run build                # static export to out/
node scripts/serve-out.mjs   # preview the built site
```
No environment variables or API keys needed.

## How it works
- **Recipes:** pipe-delimited lines (17 fields each) in `lib/recipes/*.ts` plus the `BASE` block in `lib/data.ts`, parsed into the `Recipe` type there. Filter options come straight from the data.
- **Photos:** hotlinked from external food sites and blogs, listed per recipe in `lib/photo-manifest.json` with a credit link and a fallback image. If both fail, the card shows a monogram placeholder. Photos belong to their original sources; credits appear in each recipe popup.
- **Refreshing photos:** `npm run photos` looks up recipes missing from the manifest (`--refresh` redoes all). It does not run during the build. A file at `public/photos/<recipe-slug>.jpg` replaces the external photo on the next run.

## Deploy
Static site: publish `out/`. On Netlify or Vercel, set the base (root) directory to `github-upload-ready`.
