# The Living Table

College project: a searchable archive of 500 real Indian recipes across 35 regional cuisines, styled as a colourful editorial food magazine. Single-page Next.js 14 site. It gets demoed live, so stability beats novelty.

## Where the code lives
All app code is in `github-upload-ready/`. The repo root holds only this file and `.claude/skills/`.

- `app/page.tsx`: the whole UI. Hero search, 13 filters, grid / editorial-list toggle, recipe popup (Escape closes it).
- `app/book.tsx`: floating CSS-3D cookbook on the cover with "Ingredients / Recipe / Story / Emotion" orbiting it (pure CSS, pointer parallax, reduced-motion fallback).
- `app/layout.tsx`: fonts and page metadata. `app/globals.css`: all styling, tokens on `:root`.
- `lib/data.ts`: `Recipe` type, the `BASE` block, the parser, and `OPTIONS` (filter values).
- `lib/recipes/*.ts`: recipe batches, each exported as one template string.
- `lib/photo-manifest.json`: one photo entry per recipe.
- `scripts/fetch-photos.mjs`: rebuilds the manifest (`npm run photos`). Not part of the build.

## Data
- One recipe = one pipe-delimited line with exactly 17 fields:
  `title|region|era|contributor|source|ingredient|dietary|course|method|time|difficulty|yield|season|context|ingredients|steps|story`
- `dietary` is comma-separated. `ingredients` and `steps` are semicolon-separated.
- Lines with the wrong field count are silently dropped. Lines starting with `//` are skipped. Count fields after every edit.
- New batch: export a string const from `lib/recipes/`, import it in `lib/data.ts`, append it to `RAW`.
- `OPTIONS` is derived from the data, so new values show up in filters with no extra code.
- `id` is the line index. Reordering lines changes ids.

## Photos
- No local images. Every photo is hotlinked from an external site, keyed in the manifest by `photoSlug(title)` (lowercase, hyphenated).
- Entry fields: `src` (cards), `full` (popup), `fallback` (Bing thumbnail), `credit`, `creditUrl`.
- On error: `src`/`full` → `fallback` → monogram placeholder card.
- Renaming a recipe changes its slug and orphans its photo. Rename the manifest key too.
- `public/photos/<slug>.jpg` only takes over after rerunning `npm run photos`.
- Third-party URLs can die any day. Spot-check photos before a demo.

## Run and build
```
cd github-upload-ready && npm install && npm run build
```
- Dev server: `npm run dev` → http://localhost:3000
- Build is a static export (`output: "export"`, unoptimized images) into `out/`. Netlify publishes `out/`.
- Preview the export: `node scripts/serve-out.mjs` (`next start` does not work with static export).
- GitHub Pages: build with `PAGES_BASE_PATH=/The-Living-Table- npm run build` (sets Next's `basePath`), then publish `out/` plus an empty `.nojekyll` to the orphan `gh-pages` branch. Never set the base path for Netlify or local builds.
- Node 18+. No API keys; the only env var is the optional `PAGES_BASE_PATH`.

## Design language (keep it)
- "Masala Market": light editorial magazine on warm paper (`--paper`), near-black ink headings (`--ink`), faint paper grain, a thin six-spice stripe (`--spice-stripe`) as the signature accent.
- Six spice accents, each with a fill, a text-safe `-ink` and a light `-tint`: `--haldi` (turmeric), `--kesar` (saffron), `--mirchi` (chilli), `--gulabi` (rose), `--neel` (indigo), `--kadi` (curry leaf). Only `-ink` variants (and `--neel`) are safe for small text; fills are for large text, backgrounds and marks.
- Each section sets `--accent`/`--accent-ink`/`--accent-tint`: hero saffron, contents indigo, archive chilli, popup turmeric. Cards and the popup set `--c`/`--c-ink`/`--c-tint` from `data-course` (course colours live in `globals.css`).
- Cards show the Indian veg/non-veg mark (green if dietary has Vegetarian or Vegan, red otherwise).
- Playfair Display (`--font-serif`) for headings, Inter (`--font-sans`) for body and UI.
- Use the `:root` tokens. No new hard-coded colours. Check WCAG AA contrast for any new text/background pair.
- Motion is quiet: `var(--ease-out)`, roughly 0.2 to 0.6s. Respect `prefers-reduced-motion`.
- Responsive breakpoints: 980px and 600px.
- No new UI libraries, icon packs, or font families.

## Rules
- Always run `npm run build` in `github-upload-ready/` before committing. Never commit a broken build.
- Keep the Masala Market visual style. Refine it, don't redesign it.
- Use the `apple-design` skill for motion and interaction work.
- Use the `ui-ux-pro-max` skill for UX, accessibility, and layout checks.
- Keep the recipe count in sync where it is hard-coded: `app/layout.tsx` metadata, the search placeholder in `app/page.tsx`, the README.
- Don't commit `node_modules/`, `.next/`, `out/`, or a new `package-lock.json` unless asked.
