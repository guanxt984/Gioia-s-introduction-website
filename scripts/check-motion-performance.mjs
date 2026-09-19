import assert from "node:assert/strict";
import { readdir, readFile } from "node:fs/promises";
import { createFrameImageCache, createFrameSequencePlayer } from "../src/frame-playback.js";
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

const fakeImages = [];
function fakeImageFactory() {
  const listeners = { load: [], error: [] };
  const image = {
    complete: false,
    naturalWidth: 0,
    src: "",
    addEventListener(type, listener) {
      listeners[type]?.push(listener);
    },
    finish() {
      this.complete = true;
      this.naturalWidth = 2560;
      listeners.load.forEach(listener => listener());
    },
  };
  fakeImages.push(image);
  return image;
}

const imageCache = createFrameImageCache({ imageFactory: fakeImageFactory });
imageCache.preload(["frame-1.webp", "frame-2.webp"]);
assert.equal(fakeImages.length, 2, "preloading should retain one image request per source");
const frameReady = imageCache.load("frame-1.webp");
assert.equal(frameReady, imageCache.load("frame-1.webp"), "repeated frame loads should share one readiness promise");
fakeImages[0].finish();
await frameReady;

const pendingLoads = [];
const queuedSteps = [];
const renderedFrames = [];
const flushMicrotasks = () => new Promise(resolve => setImmediate(resolve));
const sequencePlayer = createFrameSequencePlayer({
  frameCount: 2,
  frameDuration: 0,
  loadFrame: index => new Promise(resolve => pendingLoads.push({ index, resolve })),
  renderFrame: index => renderedFrames.push(index),
  schedule: callback => {
    queuedSteps.push(callback);
    return callback;
  },
  cancelSchedule: callback => {
    const index = queuedSteps.indexOf(callback);
    if (index >= 0) queuedSteps.splice(index, 1);
  },
});
sequencePlayer.start();
await Promise.resolve();
assert.deepEqual(pendingLoads.map(item => item.index), [1], "animation must wait for frame 1 before requesting frame 2");
pendingLoads.shift().resolve();
await flushMicrotasks();
assert.deepEqual(renderedFrames, [1], "a frame should render only after its asset is ready");
queuedSteps.shift()();
await flushMicrotasks();
assert.deepEqual(pendingLoads.map(item => item.index), [2], "the next frame should request only after the previous frame rendered");
pendingLoads.shift().resolve();
await flushMicrotasks();
assert.deepEqual(renderedFrames, [1, 2], "sequential playback should retain every frame in order");
sequencePlayer.stop();

console.log("PASS: animation assets and on-demand render scheduling");
