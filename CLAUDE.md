# The Living Table

College project: a searchable archive of 500 real Indian recipes across 35 regional cuisines, styled as a handwritten bahi-khata register on handmade paper. Single-page Next.js 14 site. It gets demoed live, so stability beats novelty.

**Start of every session: read `HANDOFF.md`** for current status, decisions and the ordered work queue.

## Where the code lives
All app code is in `github-upload-ready/`. The repo root holds only this file, `HANDOFF.md` and `.claude/skills/`.

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
- "Ledger": a handwritten bahi-khata register on handmade khadi paper. Panels are sheets of `--surface` and the page is `--paper`, both under the `--khadi` texture (mottled tone, short fibres, specks), with faint paper grain on top.
- Register inks: `--blue` ballpoint (the lead), `--violet` stamp pad, `--red` correction pen, `--green` pen and `--hl` highlighter. Small text uses the `-ink` variants or `--blue`/`--violet`/`--green`. `--hl` is only a fill, with `--ink` text on it.
- Print, not app: no gradients, glows, coloured shadows or pills. Corners are 2–4px. Badges, orbit words and the "T" seal are rubber stamps (the `--stamp` mask). "Table" gets the highlighter swipe (`--swipe`). The active contents row is highlighted. The cover book is red bahi-khata cloth (`--bahi`) tied with a gold cord (`--cord`). No ruled lines (Om's call).
- The old spice names (`--haldi`, `--kesar`, `--mirchi`, `--gulabi`, `--neel`, `--kadi`, each with `-ink`/`-tint`) still drive sections (`--accent*`) and course colours (`--c*` from `data-course`), but they now point at the inks. Change the inks rather than that mapping.
- Cards show the Indian veg/non-veg mark (green if dietary has Vegetarian or Vegan, red otherwise).
- Playfair Display (`--font-serif`) for headings, Inter (`--font-sans`) for body and UI.
- Use the `:root` tokens. No new hard-coded colours. Check WCAG AA contrast for any new text/background pair.
- Motion is quiet: `var(--ease-out)`, roughly 0.2 to 0.6s. Respect `prefers-reduced-motion`.
- Responsive breakpoints: 980px and 600px.
- No new UI libraries, icon packs, or font families.

## Rules
- Always run `npm run build` in `github-upload-ready/` before committing. Never commit a broken build.
- Keep the Ledger visual style. Refine it, don't redesign it.
- Use the `apple-design` skill for motion and interaction work.
- Use the `ui-ux-pro-max` skill for UX, accessibility, and layout checks.
- Keep the recipe count in sync where it is hard-coded: `app/layout.tsx` metadata, the search placeholder in `app/page.tsx`, the README.
- Don't commit `node_modules/`, `.next/`, `out/`, or a new `package-lock.json` unless asked.
