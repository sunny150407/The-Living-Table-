# Dish photos
Photos are found automatically by `scripts/fetch-photos.mjs` (Wikipedia, Wikimedia Commons, Openverse; free-licence images only)
and listed in `lib/photo-manifest.json`. It runs before every build, or by hand with `npm run photos`.
To use your own photo for a dish, save it here named after the recipe: lowercase, words joined by hyphens
(misal-pav.jpg, puran-poli.jpg). Your file always wins over an automatic one. See /PHOTO-CHECKLIST.md for all names.
