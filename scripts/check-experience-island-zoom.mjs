import assert from "node:assert/strict";
import { experienceIslandZoomRange } from "../src/experience-island-zoom.js";

const range = experienceIslandZoomRange(20);

assert.deepEqual(range, {
  minDistance: 20 / 1.5,
  initialDistance: 20 / 1.3,
  maxDistance: 20,
});
assert.ok(range.minDistance < range.initialDistance);
assert.ok(range.initialDistance < range.maxDistance);

console.log(JSON.stringify({ status: "PASS", range }, null, 2));
