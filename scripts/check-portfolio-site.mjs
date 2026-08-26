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
assert.match(reviewed, /#resume \.resume-document\s*\{[\s\S]*?transform:\s*translateX\(20px\)\s*scale\(1\.6\)\s*!important/);
assert.match(reviewed, /#resume \.resume-document\s*\{[\s\S]*?transform-origin:\s*center/);
assert.doesNotMatch(structure, /你目前位于目录页/);
assert.match(structure, /\.directory-list a\.is-current\s*\{[\s\S]*?color:\s*var\(--accent\)/);
assert.match(structure, /\.directory-list a\.is-current::before[\s\S]*?border-left:\s*\d+px solid var\(--accent\)/);
assert.match(structure, /\.school-project-panel\s*\{[\s\S]*?border:\s*0/);

const source = await fs.readFile("src/portfolio-island.js", "utf8");
const experienceAssets = [
  "school/apex/demo.mp4",
  "school/apex/cover.jpg",
  "school/apex/section.png",
  "school/uiux/ux.png",
  "school/cell-factory/photo-01.jpg",
  "school/cell-factory/photo-02.jpg",
  "school/cell-factory/photo-03.jpg",
  "school/cell-factory/innovation.mp4",
  "school/cell-factory/live.mp4",
  "internship/jiuling/photo.jpg",
  "internship/qianchuan/certificate.pdf",
  "internship/qianchuan/photo.jpg",
  "internship/qianchuan/project.png",
  "internship/lixiang/certificate.png",
  "internship/lixiang/photo.jpg",
  "internship/lixiang/project.png",
  "internship/baimi/photo-01.png",
  "internship/baimi/photo-02.jpg",
  "internship/baimi/project.png",
];
for (const key of [
  "school-apex", "school-uiux", "school-cell-factory",
  "internship-jiuling", "internship-qianchuan", "internship-lixiang", "internship-baimi",
  "personal-claude-translator", "personal-squirrel-docs", "personal-fullydancy",
]) {
  assert.match(source, new RegExp(`key:\\s*["']${key}["']`));
}
for (const [city, title] of [["深圳", "九瓴"], ["上海", "仟传"], ["北京", "理想"], ["杭州", "白米"]]) {
  assert.match(source, new RegExp(`city:\\s*["']${city}["'][\\s\\S]*?title:\\s*["']${title}["']`));
}
for (const file of experienceAssets) await fs.access(`public/assets/experience-projects/${file}`);
assert.match(source, /const EXPERIENCE_PROJECTS\s*=/);
assert.match(source, /function showExperienceProject\(projectKey\)/);
assert.match(source, /querySelectorAll\(["']video["']\)[\s\S]*?pause\(\)/);
assert.match(source, /type:\s*["']pdf["']/);
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
assert.equal((index.match(/data-experience-project=/g) || []).length, 10);
assert.match(index, /COMING SOON/);
assert.match(index, /\.experience-project-label::after[\s\S]*border/);
assert.match(index, /\.experience-project-label\.is-disabled/);
assert.match(index, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(reviewed, /transform:\s*translateX\(20px\)\s*scale\(1\.6\)\s*!important/);
assert.match(reviewed, /transform-origin:\s*center/);
assert.match(index, /@media\s*\(max-width:\s*760px\)/);
assert.match(source, /document\.hidden/);
assert.match(source, /webgl-unavailable/);
assert.match(source, /island-retry/);
assert.match(source, /updateProjectLabels/);
assert.match(source, /\.project\(camera\)/);
assert.match(source, /controls\.addEventListener\(["']change["'],\s*updateProjectLabels\)/);
assert.match(server, /pathname\s*===\s*["\']\/["\']\s*\?\s*["\']\/index\.html["\']/);

console.log(JSON.stringify({ status: "PASS", checks: "stable V11 shell and embedded island" }, null, 2));
