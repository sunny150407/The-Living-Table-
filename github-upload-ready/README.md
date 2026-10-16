# The Living Table
A warm, searchable digital food archive prototype. **All 10,000 recipes are procedurally generated sample placeholders**, not real records.

## Run locally (Node 18+)
```
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```
No environment variables or API keys are needed (no .env.example required).

## Deploy to Vercel
Push to GitHub, then at vercel.com choose Add New, Project, import `sunny150407/the-living-table`, Deploy (Next.js is auto-detected).

## Replace content
- Images: edit `lib/images.ts` (Unsplash photo IDs and `imageUrl()`); point it at your own storage/CDN later. Verify each Unsplash photo and credit before publishing.
- Records: edit `lib/data.ts`. Replace `generateRecipes()` with real records or a database query; the `Recipe` type maps to a table.
- Filter options live in `OPTIONS` in `lib/data.ts`.

## Photos (automatic)
`npm run photos` (also runs before each build) looks up a free-licence photo for every recipe and writes `lib/photo-manifest.json`.
Options: `--retry` (re-try dishes with no photo), `--refresh` (redo all). Credits show in each recipe's popup.
Your own file in `public/photos/<recipe-slug>.jpg` overrides the automatic one.
