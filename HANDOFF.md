# Handoff: where we left off (Fri 16 Oct 2026, night)

Live demo is **Monday 19 Oct**. Stability first. Read `CLAUDE.md` for how the project works; this file is the work queue.

## Branches
- `main` (`dc27cf7`): the old brown/gold version. Nothing merged yet.
- `claude/eloquent-ritchie-cqa6ud`: **all current work lives here.** Check it out first.
- `gh-pages`: a built copy of the site (from `ae1fab2`) for GitHub Pages. Don't edit it by hand; redeploy (below).

## Live site
https://sunny150407.github.io/The-Living-Table-/ works only after the repo owner turns Pages on once:
**Settings → Pages → Build and deployment → Source: "Deploy from a branch" → Branch: `gh-pages`, folder `/ (root)` → Save.** Live about a minute later.

Redeploy after changes:
```
cd github-upload-ready && PAGES_BASE_PATH=/The-Living-Table- npm run build
# copy out/ into a fresh orphan repo, add an empty .nojekyll, commit, push to origin gh-pages (force)
npm run build   # rebuild without the base path afterwards for local/Netlify use
```

## Done so far (on the claude branch)
| Commit | What |
|---|---|
| `231a158` | "Masala Market" palette: light paper plus six spice tokens, a colour per section, course-coloured badges, veg/non-veg marks |
| `fdf7a07` | Mobile fixes: 443px overflow, filter sheet trap, anchor jumps under the header, card focus ring, 44px tap targets |
| `3ab749a` | Voronoi globe replaced by a floating CSS-3D cookbook (`app/book.tsx`) with Ingredients / Recipe / Story / Emotion orbiting it |
| `ae1fab2` | Optional `PAGES_BASE_PATH` base path for GitHub Pages builds |

## Next up, in order

### 1. Palette rethink (PAUSED mid-task, start here)
Om's verdict on Masala Market: it **looks AI-made**. Specifically:
- The orange-to-red gradient "T" app-icon tile has to go.
- The soft radial colour glows have to go.
- Saffron as the lead colour is weak; pick a better one.
- It's more about how loudly the colours are used than the hues themselves.
- **Keep the light paper background.** Direction: **printed**. The book cover can stay coloured or become cloth-bound, either is fine.
- He wants **options, creative, no generic slop.** He rejected the stock fix ("one colour per section, no gradients, sharper corners") as the whole answer.

Plan: mock three print concepts as injected CSS overrides (no repo changes), send Om comparison sheets (hero with book, archive grid, popup, mobile hero), then build the one he picks properly as tokens in `globals.css`. Every theme drops the spice stripe, the glows, the gradient monogram and the pastel pills, and tightens radii to 2–6px.

1. **Ajrakh block print** (Kutch textile printing). Undyed cotton paper `#F3ECDF`, surface `#FAF6EE`, iron-black ink `#1B1714`. Lead **indigo `#1F2D5C`**, second **madder red `#A3302A`** (text ink `#8F2A24`), small amounts of ochre `#B8862B` (text `#6F4F10`) and green `#3E5B3A`. A block-print band of indigo diamonds with madder dots replaces the stripe. The book is indigo linen with a block-print band and a madder rosette. Badges are flat solid labels. Orbit words are cream tags with a double rule.
2. **Riso zine, two inks.** Paper `#F6F1E4`. **Peacock teal `#00838A`** (text `#006B71`) plus **rani pink `#E5197F`** (text and badge fill `#B5126A`), with plum `#5B2A5E` where they overprint. The hero title is slightly misregistered (pink offset shadow), placeholder tiles use halftone dots, and card hover gets a hard offset shadow. The book is a cream cover with a pink halftone sun and a teal title. Orbit words are slightly rotated stickers.
3. **Ledger / register.** Paper `#F7F4EC`, faint blue ruled lines `#C9D5EA` and a red margin rule. Lead **Reynolds ballpoint blue `#2340A0`**, **office-stamp violet `#5B3C99`**, correction red `#C0362C`, green-pen `#1F7A4D`, and highlighter `#FFE45C` (dark text `#6E5C00`). Badges and orbit words are rubber stamps; the monogram is a round violet seal; "Table" gets a highlighter swipe; the popup story sits on ruled lines. The book is a red cloth bahi-khata ledger with a gold cord.

The existing tokens (`--haldi/--kesar/--mirchi/--gulabi/--neel/--kadi` plus `-ink`/`-tint`) can be remapped per theme, so the course colours and sections follow automatically. Check WCAG AA contrast for every text pair before shipping, then update the CLAUDE.md design section.

### 2. Small 3D touches built around the book (Sat)
The popup opens like a page turn (it has no enter/exit animation today). Cards lift ≤3°. Drop the list-view tilt, which warps 970px cards. Gate everything behind `(hover: hover)` and `prefers-reduced-motion`. Use the apple-design skill.

### 3. Photo pipeline (Sat)
- **Hydration bug:** if a photo fails before React hydrates, `onError` never fires and the card stays a broken icon forever. Fix in `Photo` (`app/page.tsx`): on mount, if `img.complete && img.naturalWidth === 0`, run the error path.
- **Wrong photos:** Theeyal (a vegan dish) shows an AI "pork rice" image; Taftan (vegetarian bread) shows Shahi Murg's chicken; the Manipuri trio Chamthong/Paknam/Singju share one photo. 14 URLs are shared across 29 recipes. 24 Adobe Stock (`ftcdn`) and Freepik images may be watermarked; eyeball them.
- **Liveness:** the cloud sandbox can't reach the image hosts. Run the check on a laptop or allow the hosts in the environment's network settings.

### 4. Keyboard focus and mobile popup (Sat, lower priority)
Trap Tab inside the popup, return focus to the card on close, make ingredients keyboard-usable, and keep the popup topbar sticky on mobile.

### 5. Sunday
Code freeze. Click through on the demo laptop, the projector and a phone with cache disabled. Final redeploy. Rollback point: `dc27cf7`.

## Sandbox notes for the next session
- Playwright: `NODE_PATH=/opt/node-tools/node_modules`, `executablePath: /opt/pw-browsers/chromium-1194/chrome-linux/chrome`. Preview the export with `PORT=3001 node scripts/serve-out.mjs`.
- Mobile screenshots taken mid smooth-scroll come out blank; inject `html{scroll-behavior:auto!important}` first.
- To freeze the book animation, set the **same** `currentTime` on every `document.getAnimations()` entry; the per-word delays supply the phase offsets.
- `npm install` creates `package-lock.json`. Don't commit it.
