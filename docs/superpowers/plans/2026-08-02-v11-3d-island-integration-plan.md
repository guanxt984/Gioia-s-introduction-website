# V11 Website and 3D Experience Island Integration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Promote the approved V11 five-section portfolio into the formal site and replace its experience-island placeholder with the approved GLB viewer, requested immediately when the page opens.

**Architecture:** Keep V11's approved composition as the formal HTML entry and copy its four source fragments to stable `public/site` paths. A dedicated Three.js bundle owns the embedded canvas, loader state, controls, resize handling, visibility pause, and failure recovery; the HTML head preloads the GLB so networking starts before the user scrolls. Static contract tests protect the approved layout and eager-loading requirement, followed by browser verification of the integrated result.

**Tech Stack:** HTML, CSS, JavaScript ES modules, Three.js 0.179.1, GLTFLoader, OrbitControls, esbuild, Node.js assertion scripts.

## Global Constraints

- Preserve V11's five-section structure, typography, color, and reviewed revisions outside the experience-island placeholder.
- Keep the experience copy on the left and the 3D model in the existing right-side `.island-area` occupying about 30% of the desktop frame.
- Request `experience-island-uploaded-preview.glb` immediately on page load; do not use viewport lazy loading.
- Support drag rotation and bounded wheel zoom; disable panning.
- Do not add sub-island selection, independent zoom, or left-copy synchronization in this iteration.
- Keep every chapter at `100svh` and introduce no horizontal overflow.
- Preserve the V11 mobile rule: model above, information below.
- A model or WebGL failure must not block the other four sections.

---

### Task 1: Promote the approved V11 artifacts to stable site paths

**Files:**
- Create: `public/index.html`
- Create: `public/site/homepage-viewport-fit-v5.html`
- Create: `public/site/full-five-page-structure-v8.html`
- Create: `public/site/full-five-page-coveo-render-v9.html`
- Create: `public/site/full-five-page-reviewed-v10.html`
- Create: `scripts/check-portfolio-site.mjs`

**Interfaces:**
- Consumes: approved files under `.superpowers/brainstorm/21960-1785041086/content/`.
- Produces: `public/index.html` as the stable entry and four same-origin fragments under `public/site/`.

- [ ] **Step 1: Write the failing stable-entry contract test**

```js
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
assert.doesNotMatch(index, /\/files\//);
assert.match(index, /id=["']experience["']/);
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node scripts/check-portfolio-site.mjs`

Expected: FAIL because `public/index.html` and `public/site/*` do not exist.

- [ ] **Step 3: Copy V11 and its four dependencies to stable paths**

Copy the five approved HTML files byte-for-byte first. Then change only V11's four fetch URLs from `/files/<name>` to `./site/<name>`. Keep `#final-removal`, the reviewed stylesheet injection order, home replacement, removed utility tabs, and removed destination actions unchanged.

- [ ] **Step 4: Make the formal HTML self-identifying without changing layout**

Set the title to `AI 产品经理作品集` and add `data-portfolio-version="v11"` to `<html>`. Do not change visible copy.

- [ ] **Step 5: Run the contract test and verify GREEN**

Run: `node scripts/check-portfolio-site.mjs`

Expected: PASS for stable paths, V11 identity, and absence of `/files/` dependencies.

- [ ] **Step 6: Commit the promoted site shell**

```powershell
git add public/index.html public/site scripts/check-portfolio-site.mjs
git commit -m "feat: promote approved V11 portfolio shell"
```

### Task 2: Add an eagerly requested embedded GLB viewer

**Files:**
- Create: `src/portfolio-island.js`
- Modify: `public/index.html`
- Modify: `scripts/check-portfolio-site.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `.island-area` inserted by the V11 structure fragment and `public/models/experience-island-uploaded-preview.glb`.
- Produces: `mountExperienceIsland(container: HTMLElement): Promise<void>` and the bundle `public/portfolio-island.bundle.js`.

- [ ] **Step 1: Extend the test with eager-loading and embed contracts**

```js
const source = await fs.readFile("src/portfolio-island.js", "utf8");
const pkg = JSON.parse(await fs.readFile("package.json", "utf8"));

assert.match(index, /rel=["']preload["'][^>]+experience-island-uploaded-preview\.glb/);
assert.doesNotMatch(index, /loading=["']lazy["']/);
assert.match(index, /portfolio-island\.bundle\.js/);
assert.match(source, /experience-island-uploaded-preview\.glb/);
assert.match(source, /export async function mountExperienceIsland/);
assert.match(source, /enablePan\s*=\s*false/);
assert.match(pkg.scripts["build:site"], /portfolio-island\.js/);
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node scripts/check-portfolio-site.mjs`

Expected: FAIL because the preload, module, source file, and build script are absent.

- [ ] **Step 3: Add immediate GLB preload and bundle loading to the head**

Insert these tags into `public/index.html` before any V11 composition script:

```html
<link rel="preload" href="./models/experience-island-uploaded-preview.glb" as="fetch" crossorigin>
<script type="module" src="./portfolio-island.bundle.js"></script>
```

This starts the model request when the document head is processed, independently of scroll position.

- [ ] **Step 4: Implement the embedded renderer**

In `src/portfolio-island.js`, create a transparent antialiased `WebGLRenderer`, a perspective camera, hemisphere and directional lights, `OrbitControls`, and a `GLTFLoader`. Export `mountExperienceIsland(container)`. Set:

```js
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
renderer.setClearColor(0x000000, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minPolarAngle = Math.PI * 0.18;
controls.maxPolarAngle = Math.PI * 0.82;
```

Load `./models/experience-island-uploaded-preview.glb`, compute a `THREE.Box3`, center the scene, and derive camera distance from its bounding sphere. Clamp zoom using `controls.minDistance` and `controls.maxDistance`. Update `.island-loading` with `模型加载 ${percent}%`, then `拖动旋转 · 滚轮缩放`.

- [ ] **Step 5: Mount as soon as the composed V11 DOM is ready**

After V11 replaces `#render-root`, replace `.island-area.placeholder` content with this structure and dispatch `portfolio:ready`:

```html
<div class="island-canvas" aria-label="可旋转的 3D 经历岛"></div>
<p class="island-loading" role="status">正在加载经历岛模型…</p>
<button class="island-retry" type="button" hidden>重新加载模型</button>
```

The module listens for both an already-present `.island-canvas` and the `portfolio:ready` event, so it mounts once regardless of script timing.

- [ ] **Step 6: Add a deterministic build command**

Add:

```json
"build:site": "esbuild src/portfolio-island.js --bundle --format=esm --outfile=public/portfolio-island.bundle.js"
```

and append `npm.cmd run build:site` to `build:model`.

- [ ] **Step 7: Build and verify GREEN**

Run: `npm.cmd run build:site`

Run: `node scripts/check-portfolio-site.mjs`

Expected: both commands PASS and `public/portfolio-island.bundle.js` exists.

- [ ] **Step 8: Commit the embedded viewer**

```powershell
git add public/index.html public/portfolio-island.bundle.js src/portfolio-island.js scripts/check-portfolio-site.mjs package.json
git commit -m "feat: embed eagerly loaded 3D experience island"
```

### Task 3: Integrate visual states and responsive containment

**Files:**
- Modify: `public/index.html`
- Modify: `src/portfolio-island.js`
- Modify: `scripts/check-portfolio-site.mjs`

**Interfaces:**
- Consumes: `.island-area`, `.island-canvas`, `.island-loading`, and `.island-retry` from Task 2.
- Produces: contained desktop/mobile presentation and recoverable failure states.

- [ ] **Step 1: Add failing visual-state contract assertions**

```js
assert.match(index, /\.island-area\.is-3d/);
assert.match(index, /\.island-canvas\s*\{/);
assert.match(index, /@media\s*\(max-width:\s*760px\)/);
assert.match(source, /document\.hidden/);
assert.match(source, /webgl-unavailable/);
assert.match(source, /island-retry/);
```

- [ ] **Step 2: Run the test and verify RED**

Run: `node scripts/check-portfolio-site.mjs`

Expected: FAIL on the missing integrated visual and recovery rules.

- [ ] **Step 3: Add a final integration stylesheet after reviewed V11 styles**

Create `#island-3d-integration` with rules that keep `.island-area.is-3d` transparent, remove placeholder typography, set `overflow: visible`, and make `.island-canvas` fill the container. Position `.island-loading` beneath the canvas without changing the section height. On `max-width: 760px`, preserve V11's existing `top`, `right`, `width`, and `height` values and increase the canvas touch target without creating horizontal overflow.

- [ ] **Step 4: Add error and retry behavior**

On loader failure, set the status to `模型加载失败`, add `webgl-unavailable` only when renderer creation fails, and reveal `.island-retry`. The button calls the same guarded loader function once; repeated clicks while loading do nothing.

- [ ] **Step 5: Pause rendering only when the browser document is hidden**

Use `visibilitychange` to cancel the animation frame while `document.hidden` and restart it when visible. Do not defer the GLB request or parsing based on visibility or intersection.

- [ ] **Step 6: Run checks and verify GREEN**

Run: `npm.cmd run build:site`

Run: `node scripts/check-portfolio-site.mjs`

Run: `git diff --check`

Expected: all commands PASS.

- [ ] **Step 7: Commit integrated visual states**

```powershell
git add public/index.html public/portfolio-island.bundle.js src/portfolio-island.js scripts/check-portfolio-site.mjs
git commit -m "fix: contain 3D island across portfolio breakpoints"
```

### Task 4: Browser verification of eager loading and the complete five-section page

**Files:**
- Modify only if verification exposes a defect: `public/index.html`, `src/portfolio-island.js`, `scripts/check-portfolio-site.mjs`

**Interfaces:**
- Consumes: formal site at `http://127.0.0.1:4173/`.
- Produces: verified deliverable browser tab showing the full V11 website with embedded model.

- [ ] **Step 1: Start the local server and open the root page**

Run: `npm.cmd run serve`

Open: `http://127.0.0.1:4173/`

- [ ] **Step 2: Verify eager request before scrolling**

Immediately after navigation, inspect the page resource list and assert a request URL ending in `/models/experience-island-uploaded-preview.glb` exists while `scrollY === 0`.

- [ ] **Step 3: Verify V11 structure**

Assert exactly five top-level `.stage` sections exist with IDs `home`, `resume`, `experience`, `skills`, and `destination`. Confirm the removed left and right floating tabs remain absent.

- [ ] **Step 4: Verify the experience layout after load**

Scroll to `#experience`. Confirm the left copy remains readable, the canvas is in the right-side `.island-area`, status reads `拖动旋转 · 滚轮缩放`, and the model fits inside the section without horizontal overflow.

- [ ] **Step 5: Verify interaction and error-free runtime**

Drag the canvas horizontally and confirm the rendered view changes. Wheel over the canvas and confirm bounded zoom. Inspect console logs for errors and confirm there are none.

- [ ] **Step 6: Verify mobile containment**

At a 390 × 844 viewport, confirm the model is above the information area, all five sections remain scrollable, and `document.documentElement.scrollWidth === innerWidth`.

- [ ] **Step 7: Run final verification suite**

Run: `node scripts/check-portfolio-site.mjs`

Run: `npm.cmd run build:site`

Run: `git diff --check`

Expected: all commands PASS; keep the formal root page open as the user deliverable.
