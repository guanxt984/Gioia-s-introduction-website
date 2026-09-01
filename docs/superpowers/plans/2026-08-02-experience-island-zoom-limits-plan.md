# 经历岛缩放边界实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将经历岛的最大与最小显示尺寸限制为已确认的图 1 与图 2 视觉范围。

**Architecture:** 新建一个无浏览器依赖的纯函数，根据自动适配距离计算最近和最远相机距离；`portfolio-island.js` 在每次适配时消费该函数并更新 OrbitControls。以独立 Node 检查脚本验证边界计算，再通过真实浏览器滚轮交互验证 OrbitControls 的端点行为。

**Tech Stack:** JavaScript ES modules、Three.js OrbitControls、Node.js、esbuild、浏览器交互测试。

## Global Constraints

- 最近距离必须为 `fitDistance * 0.85`。
- 最远距离必须为 `fitDistance * 1.75`。
- 初始相机距离必须保持 `fitDistance`。
- 不调整模型、画布位置、灯光、旋转范围或页面排版。

---

### Task 1: 相对缩放边界

**Files:**
- Create: `src/experience-island-zoom.js`
- Create: `scripts/check-experience-island-zoom.mjs`
- Modify: `src/portfolio-island.js:1-72`
- Modify: `package.json`
- Rebuild: `public/portfolio-island.bundle.js`

**Interfaces:**
- Produces: `experienceIslandZoomRange(fitDistance: number): { minDistance: number, initialDistance: number, maxDistance: number }`
- Consumes: `fitModel()` 计算出的有限正数 `fitDistance`。

- [ ] **Step 1: 写失败测试**

```js
import assert from "node:assert/strict";
import { experienceIslandZoomRange } from "../src/experience-island-zoom.js";

const range = experienceIslandZoomRange(20);
assert.deepEqual(range, {
  minDistance: 17,
  initialDistance: 20,
  maxDistance: 35,
});
assert.ok(range.minDistance < range.initialDistance);
assert.ok(range.initialDistance < range.maxDistance);
console.log(JSON.stringify({ status: "PASS", range }, null, 2));
```

- [ ] **Step 2: 运行测试并确认因模块不存在而失败**

Run: `node scripts/check-experience-island-zoom.mjs`
Expected: FAIL with `ERR_MODULE_NOT_FOUND` for `src/experience-island-zoom.js`.

- [ ] **Step 3: 写最小实现并接入 OrbitControls**

```js
export function experienceIslandZoomRange(fitDistance) {
  if (!Number.isFinite(fitDistance) || fitDistance <= 0) {
    throw new RangeError("fitDistance must be a finite positive number");
  }
  return {
    minDistance: fitDistance * 0.85,
    initialDistance: fitDistance,
    maxDistance: fitDistance * 1.75,
  };
}
```

在 `fitModel()` 中调用该函数，将相机放在 `initialDistance`，并把两个端点赋给 `controls.minDistance` 与 `controls.maxDistance`。在 `package.json` 添加 `check:zoom` 脚本。

- [ ] **Step 4: 运行自动化检查并重新构建**

Run: `npm.cmd run check:zoom`
Expected: PASS，输出 `17 / 20 / 35`。

Run: `node scripts/check-portfolio-site.mjs`
Expected: PASS。

Run: `npm.cmd run build:site`
Expected: esbuild 成功生成 bundle。

- [ ] **Step 5: 浏览器验证真实缩放端点**

打开 `http://127.0.0.1:4173/#experience`，等待模型加载。连续向前滚动确认最大尺寸停止，连续向后滚动确认最小尺寸停止；两次继续滚动均不得再改变画面比例，且页面没有脚本错误。

- [ ] **Step 6: 提交实现**

```bash
git add src/experience-island-zoom.js scripts/check-experience-island-zoom.mjs src/portfolio-island.js package.json public/portfolio-island.bundle.js
git commit -m "feat: constrain experience island zoom"
```
