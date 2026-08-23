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
const reviewed = await fs.readFile("public/site/full-five-page-reviewed-v10.html", "utf8");
assert.doesNotMatch(index, /\/files\//);
assert.match(index, /data-portfolio-version=["']v11["']/);
assert.match(structure, /id=["']experience["']/);
assert.doesNotMatch(structure, /class=["']experience-list["']/);
assert.match(structure, /\.resume-document\s*\{[\s\S]*?height:\s*200%/);
assert.match(reviewed, /#resume \.resume-document\s*\{[\s\S]*?transform:\s*scale\(1\.8\)\s*!important/);
assert.match(reviewed, /#resume \.resume-document\s*\{[\s\S]*?transform-origin:\s*center/);
assert.doesNotMatch(structure, /你目前位于目录页/);
assert.match(structure, /\.directory-list a\.is-current\s*\{[\s\S]*?color:\s*var\(--accent\)/);
assert.match(structure, /\.directory-list a\.is-current::before[\s\S]*?border-left:\s*\d+px solid var\(--accent\)/);
assert.match(structure, /\.school-project-panel\s*\{[\s\S]*?border:\s*0/);

const source = await fs.readFile("src/portfolio-island.js", "utf8");
const pkg = JSON.parse(await fs.readFile("package.json", "utf8"));
const server = await fs.readFile("scripts/serve.mjs", "utf8");
assert.match(index, /rel=["']preload["'][^>]+experience-island-uploaded-preview\.glb/);
assert.doesNotMatch(index, /loading=["']lazy["']/);
assert.match(index, /portfolio-island\.bundle\.js/);
assert.match(source, /experience-island-uploaded-preview\.glb/);
assert.match(source, /export async function mountExperienceIsland/);
assert.match(source, /enablePan\s*=\s*false/);
assert.match(pkg.scripts["build:site"], /portfolio-island\.js/);
assert.match(index, /\.island-area\.is-3d/);
assert.match(index, /\.island-canvas\s*\{/);
assert.match(index, /data-school-project-trigger=["']uiux["']/);
assert.match(index, /data-school-project-trigger=["']apex["']/);
assert.match(index, /data-school-project-trigger=["']cell["']/);
assert.match(index, /@media\s*\(max-width:\s*760px\)/);
assert.match(source, /document\.hidden/);
assert.match(source, /webgl-unavailable/);
assert.match(source, /island-retry/);
assert.match(source, /updateProjectLabels/);
assert.match(source, /\.project\(camera\)/);
assert.match(source, /controls\.addEventListener\(["']change["'],\s*updateProjectLabels\)/);
assert.match(server, /pathname\s*===\s*["\']\/["\']\s*\?\s*["\']\/index\.html["\']/);

console.log(JSON.stringify({ status: "PASS", checks: "stable V11 shell and embedded island" }, null, 2));
