import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { ISLAND_CONTENT, PROJECT_CONTENT } from "../src/experience-island-content.js";
import { PROOF_CONTENT, PROOF_PROJECT_KEYS } from "../src/experience-proof-content.js";
import { canOpenExperienceMedia } from "../src/experience-island-renderers.js";

const rendererSource = await readFile(new URL("../src/experience-island-renderers.js", import.meta.url), "utf8");
assert.match(rendererSource, /event\.key === \"Escape\"/);
assert.match(rendererSource, /event\.key === \"ArrowLeft\"/);
assert.match(rendererSource, /event\.key === \"ArrowRight\"/);
assert.match(rendererSource, /target = \"_blank\"/);
assert.match(rendererSource, /noopener noreferrer/);
assert.doesNotMatch(rendererSource, /section\(\"ABOUT\"/);

assert.equal(ISLAND_CONTENT.school.projects.length, 3);
for (const project of ISLAND_CONTENT.school.projects) {
  assert.equal(project.whatIDid.length, 3);
  assert.ok(project.media.every(slot => ["image", "gallery", "video", "pdf"].includes(slot.type)));
  assert.ok(project.media.every(slot => ["id", "type", "preview", "src", "label", "hint"].every(key => key in slot)));
}
assert.equal(PROOF_PROJECT_KEYS.length, 10);
for (const key of PROOF_PROJECT_KEYS) {
  const proofs = PROOF_CONTENT[key];
  assert.ok(proofs.length >= 1, `${key} is missing proof assets`);
  for (const item of proofs) {
    assert.ok(item.id && item.src && item.type, `${key} proof metadata is incomplete`);
    assert.ok(item.width > 0 && item.height > 0 && item.aspectRatio > 0, `${key} proof ratio is invalid`);
  }
}
assert.equal(PROOF_CONTENT["school-cell-factory"].some(item => item.id === "cell-factory-awards"), true);

const workPeriods = {
  "internship-pollo-ai": "2026.06 – 2026.09",
  "internship-lixiang": "2025.12 – 2026.05",
  "internship-qianchuan": "2025.06 – 2025.12",
  "internship-baimi": "2025.01 – 2025.03",
};
for (const [key, period] of Object.entries(workPeriods)) {
  const project = PROJECT_CONTENT.get(key);
  assert.equal(project.period, period);
  assert.ok(project.workItems.length >= 1);
  assert.ok(project.resultMetrics.length >= 1);
}
assert.ok(PROJECT_CONTENT.get("internship-pollo-ai").results.some(item => item.includes("86.3%")));
assert.ok(PROJECT_CONTENT.get("internship-lixiang").workItems.some(item => item.body.includes("高于 80%")));
for (const key of ["personal-fullydancy", "personal-squirrel-docs"]) {
  const project = PROJECT_CONTENT.get(key);
  assert.equal(project.link.target, undefined);
  assert.match(project.link.url, /^https:\/\//);
  assert.equal(project.highlights.length, 3);
}
const comfy = PROJECT_CONTENT.get("personal-comfyui");
assert.equal(comfy.link.label, "查看链接");
assert.equal(comfy.highlights.length, 2);
assert.ok(comfy.media.length >= 1);
assert.equal(canOpenExperienceMedia(comfy.media[0]), false);
assert.equal(canOpenExperienceMedia({ ...comfy.media[0], src: "/media/proof.png" }), true);
assert.equal(canOpenExperienceMedia({ type: "gallery", items: [] }), false);
assert.equal(canOpenExperienceMedia({ type: "gallery", items: [{ src: "/media/one.png" }] }), true);

console.log("PASS: experience content templates, media schema, placeholders and viewer guards");
