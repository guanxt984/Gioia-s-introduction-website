import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ISLAND_CONTENT, PROJECT_CONTENT } from "../src/experience-island-content.js";

const expectedOrder = {
  internship: ["internship-pollo-ai", "internship-lixiang", "internship-qianchuan", "internship-baimi"],
  school: ["school-cell-factory", "school-apex", "school-memora"],
  personal: ["personal-fullydancy", "personal-squirrel-docs", "personal-comfyui"],
};

for (const [category, keys] of Object.entries(expectedOrder)) {
  assert.deepEqual(ISLAND_CONTENT[category].projects.map(project => project.key), keys, `${category} project order changed`);
  for (const key of keys) {
    const project = PROJECT_CONTENT.get(key);
    assert.ok(project?.entry, `${key} is missing entry metadata`);
    assert.ok(project.entry.previewImage, `${key} is missing previewImage`);
    assert.ok(project.entry.title, `${key} is missing entry title`);
    assert.ok(project.entry.description, `${key} is missing entry description`);
    assert.ok(project.entry.cta, `${key} is missing entry CTA`);
  }
}

const { layoutExperienceMasonry } = await import("../src/experience-island-masonry.js");
const layout = layoutExperienceMasonry([
  { key: "one", height: 120 },
  { key: "two", height: 80 },
  { key: "three", height: 160 },
  { key: "four", height: 90 },
], { width: 640, columns: 2, gap: 24 });

assert.deepEqual(layout.placements.map(item => item.key), ["one", "two", "three", "four"]);
assert.equal(layout.placements[0].column, 0);
assert.equal(layout.placements[1].column, 1);
assert.ok(layout.placements[2].y > layout.placements[0].y);
assert.ok(layout.height > 0);
const workLayout = layoutExperienceMasonry([
  { key: "pollo", height: 220 },
  { key: "lixiang", height: 180 },
  { key: "qianchuan", height: 200 },
  { key: "baimi", height: 160 },
], { width: 640, columns: 1, gap: 24 });
assert.deepEqual(workLayout.placements.map(item => item.column), [0, 0, 0, 0]);
assert.deepEqual(workLayout.placements.map(item => item.key), ["pollo", "lixiang", "qianchuan", "baimi"]);
const schoolLayout = layoutExperienceMasonry([
  { key: "cell", height: 180 },
  { key: "apex", height: 160 },
  { key: "memora", height: 140 },
], { width: 640, columns: 1, gap: 14 });
assert.deepEqual(schoolLayout.placements.map(item => item.column), [0, 0, 0]);
assert.deepEqual(schoolLayout.placements.map(item => item.key), ["cell", "apex", "memora"]);

const rendererSource = await readFile(new URL("../src/experience-island-renderers.js", import.meta.url), "utf8");
assert.match(rendererSource, /experience-project-card/);
assert.match(rendererSource, /layoutExperienceMasonry/);
assert.match(rendererSource, /createExperienceCardTilt/);
assert.match(rendererSource, /experience-project-tilt/);
assert.doesNotMatch(rendererSource, /section\("PROJECTS"/);
assert.match(rendererSource, /image\.loading = "lazy"/);
assert.doesNotMatch(rendererSource, /experience-project-card-cta/);
assert.doesNotMatch(rendererSource, /experience-project-arrow/);
assert.doesNotMatch(rendererSource, /body\.append\(cta\)/);
assert.doesNotMatch(rendererSource, /experience-project-number/);
assert.doesNotMatch(rendererSource, /experience-project-category/);
assert.match(rendererSource, /heading\.append\(kicker, el\("span", "experience-overview-heading-separator", "·"\), title\)/);
assert.match(rendererSource, /experience-project-period/);
assert.match(rendererSource, /is-work-overview, \.is-school-overview/);

const indexSource = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
assert.match(indexSource, /\.experience-project-card-media img/);
assert.doesNotMatch(indexSource, /\.experience-project-card-media img[^}]*object-fit\s*:\s*cover/);
assert.match(indexSource, /\.experience-project-tilt/);
assert.match(indexSource, /is-work-overview, \.is-school-overview/);
assert.match(indexSource, /\.experience-copy\[data-experience-content\]\.is-overview/);
assert.match(indexSource, /--exp-card-surface/);
assert.match(indexSource, /--exp-card-border/);
assert.match(indexSource, /--exp-card-radius/);
assert.match(indexSource, /--card-shadow-x/);
assert.match(indexSource, /--card-shadow-y/);
assert.match(indexSource, /--card-shadow-blur/);
assert.match(indexSource, /--card-shadow-alpha/);
assert.match(indexSource, /\.experience-project-card\s*\{[\s\S]*background:\s*var\(--exp-card-surface\)/);
assert.match(indexSource, /\.experience-project-card\s*\{[\s\S]*border:\s*1px solid var\(--exp-card-border\)/);
assert.match(indexSource, /\.experience-project-card\s*\{[\s\S]*border-radius:\s*var\(--exp-card-radius\)/);
assert.match(indexSource, /\.experience-project-tilt\s*\{[\s\S]*box-shadow:\s*var\(--card-shadow-x\)/);
assert.match(indexSource, /\.experience-project-card\s*\{[\s\S]*overflow:\s*visible/);
assert.match(indexSource, /\.experience-project-summary\s*\{[\s\S]*overflow:\s*visible/);
assert.doesNotMatch(indexSource, /experience-project-card-cta/);
assert.match(indexSource, /\.experience-overview-kicker[\s\S]*font:\s*600 var\(--exp-title-size/);

console.log("PASS: experience overview metadata, masonry ordering and image rules");
