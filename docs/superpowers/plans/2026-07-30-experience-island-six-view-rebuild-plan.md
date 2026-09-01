# Experience Island Six-View Rebuild Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild the experience island from the six approved modeling references as an optimized, interactive Blender/GLB asset without reusing any prior model geometry.

**Architecture:** Blender is the source of truth. The scene contains three independent child-island roots, separately named interactive props, shared low-poly materials, and eight fixed validation cameras. The exported GLB is loaded by the existing Three.js viewer for rotation, focus, hover, and performance validation.

**Tech Stack:** Blender 4.4, glTF/GLB, Three.js 0.179, Node.js validation scripts.

## Global Constraints

- Only use the six images in `docs/handoff/assets/experience-island-modeling-reference-pack/`.
- Conflict priority: `01` defines primary appearance, `06` defines plan layout, `04` defines rock thickness, and `02/03/05` fill occluded geometry.
- Do not reuse geometry, proportions, placement, or conclusions from previous programmatic models.
- Model the internship, school, and AI areas as three independent root objects separated by narrow seams.
- Keep interactive landmarks, the robot, hover car, and school workbench as individually named meshes.
- Desktop target: 80,000–120,000 triangles, no more than 12 materials, no more than 60 draw calls, GLB no larger than 12 MB.
- Visual acceptance target: at least 90/100 under the rubric in the handoff document.

---

### Task 1: Establish the clean six-view Blender source scene

**Files:**
- Create: `blender/experience_island_six_view/reference_scene.blend`
- Create: `blender/experience_island_six_view/reference_manifest.json`
- Create: `blender/experience_island_six_view/render_validation.py`

**Interfaces:**
- Consumes: the six approved images and the conflict-priority rules above.
- Produces: a clean Blender scene with reference boards, named collections, world scale, and eight validation cameras.

- [ ] Verify all six reference files exist and record SHA-256, dimensions, and roles in `reference_manifest.json`.
- [ ] Create empty collections named `REF_ONLY`, `ISLAND_INTERNSHIP`, `ISLAND_SCHOOL`, `ISLAND_AI`, `PROPS_SHARED`, `LIGHTING`, and `CAMERAS`.
- [ ] Load the six images as non-rendering reference planes inside `REF_ONLY`; do not trace geometry automatically.
- [ ] Create eight azimuth validation cameras named `CAM_FRONT`, `CAM_FRONT_RIGHT`, `CAM_RIGHT`, `CAM_REAR_RIGHT`, `CAM_REAR`, `CAM_REAR_LEFT`, `CAM_LEFT`, and `CAM_FRONT_LEFT`, plus `CAM_TOP_REFERENCE`.
- [ ] Save `reference_scene.blend` and render a contact sheet proving that all boards and cameras load.

### Task 2: Manually model and approve the three-island blockout

**Files:**
- Modify: `blender/experience_island_six_view/reference_scene.blend`
- Create: `blender/experience_island_six_view/reviews/blockout/`

**Interfaces:**
- Consumes: the scene and cameras from Task 1.
- Produces: three new, manually shaped low-poly island bases with correct seams, footprint, height, and landmark proxy volumes.

- [ ] Shape the green internship island from the top-view footprint.
- [ ] Shape the raised sand-colored school island and preserve its rear-center height.
- [ ] Shape the purple AI island with front platform, middle terrace, and rear tower platform.
- [ ] Match rock thickness against the low-angle reference and keep the three seams narrow but readable.
- [ ] Add proxy volumes for every landmark and prop; do not add final detail.
- [ ] Render all eight validation cameras at 1440×1440.
- [ ] Score silhouette, footprint, height, seam width, and proxy placement; require at least 85/100 before proceeding.

### Task 3: Manually model the internship island landmarks

**Files:**
- Modify: `blender/experience_island_six_view/reference_scene.blend`
- Create: `blender/experience_island_six_view/reviews/internship/`

**Interfaces:**
- Consumes: the approved internship blockout.
- Produces: individually named Forbidden City, Ping An Finance Center, Oriental Pearl Tower, West Lake, Broken Bridge, pavilion, paths, and trees.

- [ ] Model the Forbidden City as the largest footprint and preserve its double-eave silhouette.
- [ ] Model Ping An Finance Center as the tallest slim teal landmark.
- [ ] Model the Oriental Pearl Tower with two coral spheres and a gray shaft.
- [ ] Model the lake depression, bridge, one pavilion, winding paths, and restrained trees; include no willow.
- [ ] Render front, quarter, rear, left-low, and top comparisons.
- [ ] Require at least 90% on internship silhouette, landmark placement, and color-block layout.

### Task 4: Manually model the school and AI islands

**Files:**
- Modify: `blender/experience_island_six_view/reference_scene.blend`
- Create: `blender/experience_island_six_view/reviews/school-ai/`

**Interfaces:**
- Consumes: the approved three-island blockout.
- Produces: the school workbench scene and AI city elements as independent interactive objects.

- [ ] Model two students, one large workbench, concept models, drawings, rear arch, and one tree.
- [ ] Model the AI research tower, cylindrical lab, dome, ring track, robot platform, lights, and wheel-free agile hover car.
- [ ] Keep the school island warm and elevated; keep the AI island lavender-blue with cyan accents.
- [ ] Render all eight validation cameras and require at least 90% on key-object placement and silhouette.

### Task 5: Materials, lighting, optimization, and GLB export

**Files:**
- Modify: `blender/experience_island_six_view/reference_scene.blend`
- Create: `public/assets/experience-island.glb`
- Create: `blender/experience_island_six_view/export_report.json`

**Interfaces:**
- Consumes: the approved complete model.
- Produces: an optimized GLB with stable names, pivots, hierarchy, and measured budgets.

- [ ] Build no more than 12 shared flat-shaded materials and calibrate colors to `01-primary-front-view.jpg`.
- [ ] Configure soft warm lighting and baked ambient occlusion without embedding reference-image lighting as texture.
- [ ] Remove hidden faces and merge only non-interactive static meshes.
- [ ] Export GLB with three child-island roots and stable prop names.
- [ ] Record triangle count, materials, draw calls, texture memory, and file size.
- [ ] Reject export if any desktop budget is exceeded or visual score drops below 90/100.

### Task 6: Three.js interaction and final validation

**Files:**
- Modify: `src/viewer.js`
- Modify: `scripts/check-model.mjs`
- Create: `scripts/check-six-view-model.mjs`

**Interfaces:**
- Consumes: `public/assets/experience-island.glb`.
- Produces: rotation, island focus, prop hover, reduced-motion behavior, and automated structural checks.

- [ ] Write failing checks for three island roots, required props, materials, triangle count, and file size.
- [ ] Load the new GLB and verify the checks fail before integration if names or budgets are wrong.
- [ ] Implement perspective rotation, interruptible camera focus, raycast hit meshes, single-object hover, touch selection, and reduced-motion fallback.
- [ ] Run `npm run build:viewer` and the new model checker.
- [ ] Capture desktop and mobile screenshots plus an eight-angle model contact sheet.
- [ ] Complete the 100-point handoff rubric and require at least 90/100 before delivery.
