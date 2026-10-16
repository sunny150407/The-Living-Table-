// High-resolution Unsplash hero tile IDs used by the 3D Voronoi globe on the cover
export const IMAGE_IDS = [
  "photo-1585937421612-70a008356fbe",
  "photo-1565557623262-b51c2513a641",
  "photo-1631452180519-c014fe946bc7",
  "photo-1601050690597-df0568f70950",
  "photo-1567188040759-fb8a883dc6d8",
  "photo-1546833999-b9f581a1996d",
  "photo-1596797038530-2c107229654b",
  "photo-1626777552726-4a6b54c97e46",
  "photo-1517244683847-7456b63c5969",
  "photo-1606491956689-2ea866880c84",
];

export const imageUrl = (i: number, w = 600) =>
  `https://images.unsplash.com/${IMAGE_IDS[i % IMAGE_IDS.length]}?auto=format&fit=crop&w=${w}&q=80`;

export const creditUrl = (i: number) =>
  `https://unsplash.com/photos/${IMAGE_IDS[i % IMAGE_IDS.length].replace("photo-", "")}?utm_source=the-living-table&utm_medium=referral`;

export const photoSlug = (title: string) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

export const photoSrc = (title: string) => `/photos/${photoSlug(title)}.jpg`;

export type DishPhoto = {
  src: string;
  fallback?: string;
  full: string;
  credit: string;
  creditUrl: string;
};

// All 500 recipes are pre-populated with curated studio/editorial food photography in lib/photo-manifest.json.
// We no longer fall back to unvetted Wikipedia/Wikimedia Commons snapshots at runtime.
export async function dishPhoto(_title: string): Promise<DishPhoto | null> {
  return null;
}
