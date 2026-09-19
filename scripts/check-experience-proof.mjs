import assert from "node:assert/strict";
import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { PROOF_CONTENT } from "../src/experience-proof-content.js";
import { chooseProofLayout } from "../src/experience-proof-layout.js";

const items = [
  { id: "wide", aspectRatio: 2.2 },
  { id: "portrait", aspectRatio: 0.46 },
  { id: "square", aspectRatio: 1 },
  { id: "landscape", aspectRatio: 1.9 },
];
const result = chooseProofLayout(items, { width: 900, height: 520, gap: 12 });
assert.deepEqual(result.placements.map(item => item.key), items.map(item => item.id));
assert.ok(result.width <= 900 + 0.01);
assert.ok(result.height <= 520 + 0.01);
for (const placement of result.placements) {
  assert.ok(placement.x >= -0.01 && placement.y >= -0.01);
  assert.ok(placement.x + placement.width <= 900.01);
  assert.ok(placement.y + placement.height <= 520.01);
  assert.ok(placement.width > 0 && placement.height > 0);
}

for (const proofs of Object.values(PROOF_CONTENT)) {
  for (const item of proofs) {
    await access(resolve("public", item.src.replace(/^\.\//, "")));
    if (item.preview) await access(resolve("public", item.preview.replace(/^\.\//, "")));
  }
}
for (let index = 0; index < result.placements.length; index += 1) {
  for (let next = index + 1; next < result.placements.length; next += 1) {
    const left = result.placements[index];
    const right = result.placements[next];
    const separated = left.x + left.width <= right.x + 0.01 || right.x + right.width <= left.x + 0.01 || left.y + left.height <= right.y + 0.01 || right.y + right.height <= left.y + 0.01;
    assert.equal(separated, true, `proof placements overlap: ${left.key}/${right.key}`);
  }
}

const rendererSource = await readFile(new URL("../src/experience-island-renderers.js", import.meta.url), "utf8");
assert.match(rendererSource, /chooseProofLayout/);
assert.match(rendererSource, /proofAvailableRect/);
assert.match(rendererSource, /loadedmetadata/);
assert.match(rendererSource, /experience-proof-canvas/);
assert.match(rendererSource, /openExperienceMediaInNewTab/);
assert.match(rendererSource, /window\.open\(url, "_blank", "noopener,noreferrer"\)/);
assert.match(rendererSource, /PROOF（在此区域下滑 \/ 点击试试）/);
assert.match(rendererSource, /experience-proof-pdf-hint/);

const indexSource = await readFile(new URL("../public/index.html", import.meta.url), "utf8");
assert.match(indexSource, /\.experience-proof-canvas\s*\{/);
assert.match(indexSource, /object-fit:\s*contain/);
assert.doesNotMatch(indexSource, /experience-proof-canvas[\s\S]*object-fit:\s*cover/);
assert.match(indexSource, /\.experience-proof-pdf-hint\s*\{/);

console.log("PASS: adaptive proof layout stays ordered, contained and collision-free");
