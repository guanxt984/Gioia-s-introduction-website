import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createRenderScheduler } from "../src/render-scheduler.js";

const frameSets = [
  ["public/assets/home-to-directory", /^frame_\d{6}\.webp$/, 143],
  ["public/assets/directory-transition", /^frame_\d{5}\.webp$/, 60],
  ["public/assets/directory-sequel", /^frame_\d{6}\.webp$/, 97],
  ["public/assets/destination-transition", /^frame_\d{5}\.webp$/, 249],
];

for (const [directory, pattern, expectedCount] of frameSets) {
  const files = await readdir(directory);
  const webp = files.filter(file => pattern.test(file));
  const png = files.filter(file => /\.png$/i.test(file));
  assert.equal(webp.length, expectedCount, `${directory} should contain every animation frame as WebP`);
  assert.equal(png.length, 0, `${directory} should not ship the original PNG frames`);
}

const transitionSource = await readFile("src/home-transition.js", "utf8");
assert.match(transitionSource, /frameSource\(index\)[\s\S]+?\.webp/);
assert.match(transitionSource, /directoryFrameSource\(index\)[\s\S]+?\.webp/);
assert.match(transitionSource, /sequelFrameSource\(index\)[\s\S]+?\.webp/);
assert.match(transitionSource, /destinationFrameSource\(index\)[\s\S]+?\.webp/);

const islandSource = await readFile("src/portfolio-island.js", "utf8");
assert.match(islandSource, /createRenderScheduler/);
assert.match(islandSource, /new IntersectionObserver/);
assert.match(islandSource, /PIXEL_RATIO_CAP\s*=\s*1\.5/);

const viewerSource = await readFile("src/viewer.js", "utf8");
assert.match(viewerSource, /setPixelRatio\(Math\.min\(devicePixelRatio, 1\.5\)\)/);

const callbacks = [];
const cancelled = [];
const scheduler = createRenderScheduler({
  requestFrame: callback => {
    callbacks.push(callback);
    return callbacks.length;
  },
  cancelFrame: id => cancelled.push(id),
  renderFrame: () => false,
});

scheduler.start();
assert.equal(callbacks.length, 1, "starting a visible scene should request one frame");
scheduler.invalidate();
assert.equal(callbacks.length, 1, "multiple invalidations should share one pending frame");
callbacks.shift()(100);
assert.equal(callbacks.length, 0, "an idle scene should stop after its rendered frame");

const activeCallbacks = [];
const activeScheduler = createRenderScheduler({
  requestFrame: callback => {
    activeCallbacks.push(callback);
    return activeCallbacks.length;
  },
  cancelFrame: id => cancelled.push(id),
  renderFrame: () => true,
});
activeScheduler.start();
activeCallbacks.shift()(100);
assert.equal(activeCallbacks.length, 1, "an active transition should keep requesting frames");
activeScheduler.stop();
assert.ok(cancelled.length > 0, "stopping an invisible scene should cancel its pending frame");

console.log("PASS: animation assets and on-demand render scheduling");
