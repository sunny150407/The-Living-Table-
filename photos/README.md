# Dish photos
Photos are hotlinked from external sites and listed in `lib/photo-manifest.json`. `npm run photos` fills in recipes that have no photo yet; it does not run during the build.
To use your own photo, save it here as the recipe title in lowercase with words joined by hyphens (`misal-pav.jpg`, `puran-poli.jpg`; .jpg, .jpeg, .png or .webp), then run `npm run photos`. Your file replaces the external photo.
