import fs from "node:fs";
import vm from "node:vm";

const source = fs.readFileSync(new URL("../assets/js/data.js", import.meta.url), "utf8");
const context = {};
vm.createContext(context);
vm.runInContext(`${source}\nthis.result = { PROJECTS, FEATURED_PROJECTS, GALLERIES };`, context);

const { PROJECTS, FEATURED_PROJECTS, GALLERIES } = context.result;
const errors = [];

if (PROJECTS.length !== 36) errors.push(`Expected 36 projects, found ${PROJECTS.length}.`);
if (FEATURED_PROJECTS.length !== 24) errors.push(`Expected 24 featured projects, found ${FEATURED_PROJECTS.length}.`);

for (const project of PROJECTS) {
  const gallery = GALLERIES[project.key];
  if (!gallery) {
    errors.push(`Missing gallery: ${project.key}`);
    continue;
  }
  for (const image of gallery.images) {
    const imagePath = new URL(`../${image.src}`, import.meta.url);
    if (!fs.existsSync(imagePath)) errors.push(`Missing image: ${image.src}`);
  }
}

for (const key of FEATURED_PROJECTS) {
  if (!PROJECTS.some((project) => project.key === key)) errors.push(`Unknown featured project: ${key}`);
}

if (errors.length) {
  console.error(errors.join("\n"));
  process.exit(1);
}

const galleryImageCount = Object.values(GALLERIES).reduce((count, gallery) => count + gallery.images.length, 0);
console.log(`Content check passed: ${PROJECTS.length} projects, ${FEATURED_PROJECTS.length} featured, ${galleryImageCount} gallery images.`);
