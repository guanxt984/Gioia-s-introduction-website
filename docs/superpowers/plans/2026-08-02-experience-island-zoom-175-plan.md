# Experience Island 1.75x Default Zoom Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Open the island at visual scale 1.75x, clamp between 1x and 2x, and position the canvas 20px left of its original center.

**Architecture:** Keep responsive model fitting as the source of truth. Convert visual zoom multipliers into OrbitControls distances with fitDistance divided by zoom. Keep horizontal placement in the existing island-canvas CSS so model coordinates and interaction math remain unchanged.

**Tech Stack:** JavaScript ES modules, Three.js OrbitControls, static HTML/CSS, Node.js assertions, esbuild.

## Global Constraints

- Minimum visual scale is exactly 1x.
- Initial visual scale is exactly 1.75x.
- Maximum visual scale is exactly 2x.
- Desktop and mobile canvas placement is exactly 20px left of the original center.
- Preserve model, materials, lights, rotation, damping, disabled panning, and unclipped canvas.

---

### Task 1: Define visual zoom multipliers

**Files:**
- Modify: scripts/check-experience-island-zoom.mjs
- Modify: src/experience-island-zoom.js

**Interfaces:**
- Consumes: experienceIslandZoomRange(fitDistance)
- Produces: minDistance, initialDistance, maxDistance for visual scales 2x, 1.75x, 1x.

- [ ] Step 1: Change the assertion for fitDistance 20 to literal distances 10, 20 / 1.75, and 20.
- [ ] Step 2: Run npm.cmd run check:zoom and verify it fails because current output is 17, 20, 35.
- [ ] Step 3: Return fitDistance / 2, fitDistance / 1.75, and fitDistance.
- [ ] Step 4: Run npm.cmd run check:zoom and verify it passes with 10, 11.428571428571429, 20.

### Task 2: Move the canvas left and rebuild

**Files:**
- Modify: public/index.html
- Regenerate: public/portfolio-island.bundle.js

**Interfaces:**
- Consumes: desktop and mobile island-canvas positioning rules.
- Produces: an unclipped canvas centered at calc(50% - 20px).

- [ ] Step 1: Change both transforms from translate(calc(-50% - 10px), -50%) to translate(calc(-50% - 20px), -50%).
- [ ] Step 2: Run npm.cmd run build:site and verify esbuild succeeds.
- [ ] Step 3: Run node scripts/check-portfolio-site.mjs and git diff --check; both must exit 0.

### Task 3: Browser verification

**Files:**
- Verify: http://127.0.0.1:4173/#experience

- [ ] Step 1: Reload and confirm the island is loaded at 1.75x.
- [ ] Step 2: Zoom to 2x, scroll once more, and confirm the rendered frame does not change.
- [ ] Step 3: Zoom to 1x, scroll once more, and confirm the rendered frame does not change.
- [ ] Step 4: Confirm computed desktop transform includes -20px and the island remains unclipped.

## Self-review

- Spec coverage: all six acceptance criteria map to Tasks 1-3.
- Placeholder scan: no TBD, TODO, deferred implementation, or vague error-handling steps.
- Interface consistency: the existing experienceIslandZoomRange return shape remains unchanged.
