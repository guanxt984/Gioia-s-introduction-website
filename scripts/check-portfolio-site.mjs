import assert from "node:assert/strict";
import fs from "node:fs/promises";

const index = await fs.readFile("public/index.html", "utf8");
const required = [
  "homepage-viewport-fit-v5.html",
  "full-five-page-structure-v8.html",
  "full-five-page-coveo-render-v9.html",
  "full-five-page-reviewed-v10.html",
];

for (const file of required) {
  await fs.access(`public/site/${file}`);
  assert.match(index, new RegExp(`\\./site/${file.replaceAll(".", "\\.")}`));
}

const structure = await fs.readFile("public/site/full-five-page-structure-v8.html", "utf8");
assert.doesNotMatch(index, /\/files\//);
assert.match(index, /data-portfolio-version=["']v11["']/);
assert.match(structure, /id=["']experience["']/);

const source = await fs.readFile("src/portfolio-island.js", "utf8");
const pkg = JSON.parse(await fs.readFile("package.json", "utf8"));
assert.match(index, /rel=["']preload["'][^>]+experience-island-uploaded-preview\.glb/);
assert.doesNotMatch(index, /loading=["']lazy["']/);
assert.match(index, /portfolio-island\.bundle\.js/);
assert.match(source, /experience-island-uploaded-preview\.glb/);
assert.match(source, /export async function mountExperienceIsland/);
assert.match(source, /enablePan\s*=\s*false/);
assert.match(pkg.scripts["build:site"], /portfolio-island\.js/);

console.log(JSON.stringify({ status: "PASS", checks: "stable V11 shell and embedded island" }, null, 2));
