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
