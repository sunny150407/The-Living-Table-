// Finds a high-resolution, studio/editorial food photograph for every recipe and writes lib/photo-manifest.json.
// Prioritizes Unsplash, Stockcake, Pexels, TasteAtlas, and premier editorial food photography while strictly blocking
// amateur Wikimedia snapshots, watermarked stock sites, movie posters, and text-banner thumbnails.
import fs from "node:fs";
import path from "node:path";

const root = process.cwd();
const args = new Map(
  process.argv.slice(2).map((a) => {
    const [k, v] = a.replace(/^--/, "").split("=");
    return [k, v ?? true];
  })
);
const MANIFEST = path.join(root, "lib/photo-manifest.json");
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36";

export const slugOf = (t) =>
  t
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const STOP = new Set([
  "the",
  "and",
  "ki",
  "ka",
  "ke",
  "with",
  "style",
  "nu",
  "no",
  "di",
  "da",
  "food",
  "recipe",
  "indian",
  "dish",
]);

export const tokens = (t) =>
  t
    .toLowerCase()
    .replace(/\(.*?\)/g, " ")
    .split(/[^a-z]+/)
    .filter((w) => w.length > 2 && !STOP.has(w));

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// Studio & editorial food photography sources that do not place text banners or watermarks on images
const STUDIO_DOMAINS = [
  "images.unsplash.com",
  "plus.unsplash.com",
  "unsplash.com",
  "images.pexels.com",
  "pexels.com",
  "images.stockcake.com",
  "stockcake.com",
  "img.freepik.com/free-photo",
  "cdn.tasteatlas.com",
  "tasteatlas.com",
  "images.slurrp.com",
  "c.ndtvimg.com",
  "i.ndtvimg.com",
  "bongeats.com",
  "ministryofcurry.com",
  "myfoodstory.com",
  "whiskaffair.com",
  "archanaskitchen.com",
  "seriouseats.com",
  "saveur.com",
  "bbcgoodfood.com",
  "greatbritishchefs.com",
  "nytcooking.com",
];

// Strictly blocked domains & keywords: watermarked agencies, amateur wiki snapshots, video thumbnails, movie posters, text-heavy recipe cards
const BLOCKED = [
  "alamy.",
  "dreamstime.",
  "shutterstock.",
  "gettyimages.",
  "istockphoto.",
  "123rf.",
  "depositphotos.",
  "bigstock",
  "vecteezy.",
  "canstockphoto.",
  "agefotostock.",
  "pond5.",
  "wikimedia.org",
  "wikipedia.org",
  "freepik.com/premium",
  "maxresdefault",
  "hqdefault",
  "sddefault",
  "ytimg.com",
  "youtube.com",
  "youtu.be",
  "tiktok.com",
  "dailymotion.",
  "facebook.com",
  "fbcdn.net",
  "instagram.com",
  "cdninstagram.com",
  "twitter.com",
  "twimg.com",
  "reddit.com",
  "redd.it",
  "quora.com",
  "indiamart.com",
  "amazon.",
  "flipkart.",
  "ebay.",
  "walmart.",
  "jiomart.",
  "bigbasket.",
  "netflix",
  "imdb",
  "bollywood",
  "movie",
  "film",
  "trailer",
  "actor",
  "actress",
  "poster",
  "lyrics",
  "box-office",
  "boxoffice",
  "meme",
  "cartoon",
  "clipart",
  "vector",
  "logo",
  "icon",
  "infographic",
  "collage",
  "step-by-step",
  "tarladalal.com",
  "hebbarskitchen.com",
  "vegrecipesofindia.com",
  "madhurasrecipe.com",
  "padhuskitchen.com",
  "rakskitchen.net",
  "jeyashriskitchen.com",
  "vidhyashomecooking.com",
  "kannammacooks.com",
  "sanjeevkapoor.com",
  "pinterest.",
  "pinimg.com",
  "artofit.org",
];

function loadRecipes() {
  const files = [
    path.join(root, "lib/data.ts"),
    ...fs
      .readdirSync(path.join(root, "lib/recipes"))
      .filter((f) => f.endsWith(".ts"))
      .map((f) => path.join(root, "lib/recipes", f)),
  ];
  const seen = new Set();
  const out = [];
  for (const f of files) {
    for (const m of fs.readFileSync(f, "utf8").matchAll(/`([\s\S]*?)`/g)) {
      for (const line of m[1].split("\n")) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith("//")) continue;
        const p = trimmed.split("|");
        if (p.length === 17) {
          const title = p[0].trim();
          if (!seen.has(title)) {
            seen.add(title);
            out.push({
              title,
              region: p[1].trim(),
              ingredient: p[5].trim(),
              course: p[7].trim(),
            });
          }
        }
      }
    }
  }
  return out;
}

async function searchBing(query, wideOnly = true) {
  const aspect = wideOnly ? "+filterui:aspect-wide" : "";
  const url = `https://www.bing.com/images/async?q=${encodeURIComponent(
    query
  )}&first=1&count=35&qft=+filterui:imagesize-large${aspect}+filterui:photo-photo`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const ac = new AbortController();
      const to = setTimeout(() => ac.abort(), 12000);
      const r = await fetch(url, { headers: { "User-Agent": UA }, signal: ac.signal });
      clearTimeout(to);
      if (!r.ok) continue;
      const html = await r.text();
      const out = [];
      for (const m of html.matchAll(/m="([^"]+)"/g)) {
        try {
          const raw = m[1].replace(/&quot;/g, '"').replace(/&amp;/g, "&");
          if (!raw.startsWith("{")) continue;
          out.push(JSON.parse(raw));
        } catch {}
      }
      if (out.length > 0) return out;
    } catch {
      await sleep(400);
    }
  }
  return [];
}

function pickBest(items, want, allWant, noParen, requireTokenMatch = true) {
  let best = null;
  let bestScore = -999;

  for (const obj of items) {
    const murl = String(obj.murl || "");
    const turl = String(obj.turl || "");
    const purl = String(obj.purl || "");
    const desc = String(obj.t || "") + " " + String(obj.desc || "");
    const combined = (murl + " " + purl + " " + desc).toLowerCase();

    if (!turl || !murl) continue;
    if (BLOCKED.some((b) => combined.includes(b))) continue;
    if (!/\.(jpe?g|png|webp)(\?|$)/i.test(murl)) continue;

    const matchedCore = want.filter((w) => combined.includes(w)).length;
    const matchedAny = allWant.filter((w) => combined.includes(w)).length;
    if (requireTokenMatch && want.length > 0 && matchedCore === 0 && matchedAny === 0) continue;

    let score = matchedCore * 22 + matchedAny * 8;

    if (combined.includes("unsplash.com")) score += 85;
    else if (combined.includes("stockcake.com") || combined.includes("pexels.com")) score += 68;
    else if (combined.includes("img.freepik.com/free-photo") || combined.includes("tasteatlas.com")) score += 62;
    else if (STUDIO_DOMAINS.some((d) => combined.includes(d))) score += 45;

    if (
      combined.includes("photography") ||
      combined.includes("restaurant") ||
      combined.includes("traditional") ||
      combined.includes("authentic")
    ) {
      score += 12;
    }

    if (score > bestScore) {
      bestScore = score;
      const cleanCredit = obj.t
        ? obj.t
            .replace(/\s+\|.*$/, "")
            .replace(/\s+-\s+.*$/, "")
            .replace(/https?:\/\/\S+/g, "")
            .slice(0, 60)
            .trim()
        : `${noParen}`;
      best = {
        src: murl,
        fallback: turl,
        full: murl,
        credit: cleanCredit || `${noParen}`,
        creditUrl: purl || murl,
      };
    }
  }
  return best;
}

async function findStudioPhoto(rec) {
  const { title, region, ingredient, course } = rec;
  const noParen = title.replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim();
  const paren = (title.match(/\((.*?)\)/) || [])[1] || "";
  const want = tokens(noParen);
  const allWant = [...new Set([...want, ...tokens(paren), ...tokens(region)])];

  // Pass 1: Strict wide-aspect studio food photography search
  const q1 = `${noParen} ${paren || region} indian food photography dish`.replace(/\s+/g, " ").trim();
  const items1 = await searchBing(q1, true);
  let hit = pickBest(items1, want, allWant, noParen, true);
  if (hit) return hit;

  // Pass 2: Any aspect ratio with token match
  const items2 = await searchBing(`${noParen} ${region} indian food dish`, false);
  hit = pickBest(items2, want, allWant, noParen, true);
  if (hit) return hit;

  // Pass 3: Fallback using parenthetical description or region + ingredient + course
  const q3 = `${paren || noParen} ${region} ${ingredient} ${course} indian food photography`
    .replace(/\s+/g, " ")
    .trim();
  const items3 = await searchBing(q3, true);
  return pickBest(items3, want, allWant, noParen, false);
}

function localPhoto(slug) {
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    if (fs.existsSync(path.join(root, "public/photos", `${slug}.${ext}`))) {
      return {
        src: `/photos/${slug}.${ext}`,
        fallback: `/photos/${slug}.${ext}`,
        full: `/photos/${slug}.${ext}`,
        credit: "Own photo",
        creditUrl: "",
      };
    }
  }
  return null;
}

async function main() {
  const recipes = loadRecipes();
  if (args.get("dry")) {
    console.log(`${recipes.length} recipes found`);
    return;
  }

  let manifest = {};
  if (!args.get("refresh")) {
    try {
      manifest = JSON.parse(fs.readFileSync(MANIFEST, "utf8"));
    } catch {}
  }

  const todo = [];
  let local = 0;
  for (const r of recipes) {
    const s = slugOf(r.title);
    const own = localPhoto(s);
    if (own) {
      manifest[s] = own;
      local++;
      continue;
    }
    if (args.get("refresh") || !manifest[s]) {
      todo.push(r);
    }
  }

  console.log(`[photos] ${recipes.length} recipes, ${local} own photos, ${todo.length} to look up`);
  let found = 0,
    missing = 0,
    idx = 0;

  const worker = async () => {
    while (idx < todo.length) {
      const current = idx++;
      const rec = todo[current];
      const s = slugOf(rec.title);
      const hit = await findStudioPhoto(rec);
      manifest[s] = hit || null;
      if (hit) found++;
      else missing++;
      if ((found + missing) % 50 === 0) {
        console.log(`[photos] progress: ${found + missing}/${todo.length} (${found} matched)`);
      }
      await sleep(80);
    }
  };

  await Promise.all(Array.from({ length: 8 }, () => worker()));

  const sorted = Object.fromEntries(Object.entries(manifest).sort(([a], [b]) => a.localeCompare(b)));
  fs.writeFileSync(MANIFEST, JSON.stringify(sorted, null, 1) + "\n");
  console.log(
    `[photos] Done! Found ${found}, missing ${missing}. Total manifest entries: ${
      Object.values(sorted).filter(Boolean).length
    }/${recipes.length}`
  );
}

if (process.argv[1] && import.meta.url.endsWith(path.basename(process.argv[1]))) {
  main().catch((e) => console.log("[photos] error:", e.message));
}
