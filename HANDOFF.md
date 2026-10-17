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

### 1. Palette rethink (DONE, Sat 17 Oct)
Om rejected Masala Market as AI-made, so three print concepts were mocked: Ajrakh block print, a two-ink Riso zine, and a Ledger/bahi-khata register. He picked **Ledger, without ruled lines, on handmade paper**. It's now built as tokens in `globals.css` (see the CLAUDE.md design section). The mocks, comparison sheets and screenshot rig are in the project files under `palette-mocks/`.

### 2. Small 3D touches built around the book (Sat)
The popup opens like a page turn (it has no enter/exit animation today). Cards lift ≤3°. Drop the list-view tilt, which warps 970px cards. Gate everything behind `(hover: hover)` and `prefers-reduced-motion`. Use the apple-design skill.

### 3. Photo pipeline (DROPPED by Om, 17 Oct: leave it alone)
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
