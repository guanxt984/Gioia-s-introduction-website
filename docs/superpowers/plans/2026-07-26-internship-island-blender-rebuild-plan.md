# 实习经历岛 Blender 精模重建 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 重建一座达到参考图成品级微缩世界质感、同时适合网页实时加载的实习经历子岛。

**Architecture:** 使用 Blender Python 生成可复现的基础场景，并在 Blender 源文件中完成地形、建筑和景观的模块化建模。每个城市地标保留独立集合，统一挂载到 `island_internship` 根节点；导出后使用 glTF Transform 检查并压缩 GLB，最后接入现有 Three.js 单岛查看器。

**Tech Stack:** Blender 4.4、Blender Python API、glTF 2.0/GLB、glTF Transform、Three.js、esbuild

## Global Constraints

- 本轮只制作实习经历岛。
- 北京最大、深圳第二、上海第三、杭州最小。
- 最终模型目标 30,000–60,000 个三角面。
- 最终 GLB 目标 1–3 MB，上限 4 MB。
- 材质槽不超过 12 个。
- 根节点必须命名为 `island_internship`。
- 采用暖米白环境、葱绿色地形与柔和低饱和建筑配色。

---

### Task 1: 建立可验证的模型质量门槛

**Files:**
- Modify: `scripts/check-internship-model.mjs`
- Modify: `package.json`

**Interfaces:**
- Consumes: `public/models/island-internship-final.glb`
- Produces: `npm run check:internship` 的结构化检查报告

- [ ] **Step 1:** 将检查目标改为 `island-internship-final.glb`，加入三角面 30,000–60,000、文件不超过 4 MB、材质不超过 12 个、必需节点存在的断言。
- [ ] **Step 2:** 运行 `npm.cmd run check:internship`，确认在最终模型尚不存在时失败。
- [ ] **Step 3:** 保留失败输出，作为后续导出的验收基线。

### Task 2: 重建连续悬浮岛地形

**Files:**
- Create: `blender/internship_island/terrain.py`
- Create: `blender/internship_island/materials.py`
- Modify: `blender/build_internship_island.py`
- Output: `assets/3d/island-internship.blend`

**Interfaces:**
- Produces: `build_terrain(root, materials)`，返回包含岩层、草地、平台、道路槽与湖盆的对象集合。

- [ ] **Step 1:** 建立向下收拢的完整岩体，并使用不规则环形拓扑形成切面。
- [ ] **Step 2:** 制作后高前低的三层草地平台、坡道与凹地。
- [ ] **Step 3:** 建立道路、台阶和西湖湖盆的空间占位。
- [ ] **Step 4:** 渲染地形灰盒图，检查是否消除规则叠盘感。
- [ ] **Step 5:** 保存可复现的 Blender 源文件。

### Task 3: 制作故宫建筑群

**Files:**
- Create: `blender/internship_island/forbidden_city.py`
- Modify: `blender/build_internship_island.py`

**Interfaces:**
- Consumes: 后方最高层地形锚点
- Produces: `build_forbidden_city(parent, materials, origin)` 返回故宫集合

- [ ] **Step 1:** 制作带厚度、飞檐与屋脊的双层主殿。
- [ ] **Step 2:** 制作次殿、门楼、围墙、庭院和主台阶。
- [ ] **Step 3:** 增加柱列、门窗、台基与屋顶层级。
- [ ] **Step 4:** 从正面、侧面和背面三个角度渲染，检查辨识度与穿模。

### Task 4: 制作深圳、上海和杭州地标

**Files:**
- Create: `blender/internship_island/landmarks.py`
- Modify: `blender/build_internship_island.py`

**Interfaces:**
- Produces: `build_ping_an(...)`、`build_oriental_pearl(...)`、`build_west_lake(...)`

- [ ] **Step 1:** 制作具有多段收分、立面竖线、冠部与尖塔的平安国际金融中心。
- [ ] **Step 2:** 制作具有三脚支撑、双球体、观景层和天线的东方明珠。
- [ ] **Step 3:** 制作嵌入式西湖、拱桥、柳树、湖岸石块和小亭。
- [ ] **Step 4:** 检查四个区域的面积排序和轮廓辨识度。

### Task 5: 补充景观细节并统一美术

**Files:**
- Create: `blender/internship_island/props.py`
- Modify: `blender/build_internship_island.py`

**Interfaces:**
- Produces: 可实例化的树木、灌木、石块、路灯和悬浮碎石

- [ ] **Step 1:** 沿道路和平台布置 8–14 棵树木或灌木。
- [ ] **Step 2:** 添加湖岸石块、广场铺装、路灯和 4–7 块悬浮碎石。
- [ ] **Step 3:** 调整材质色板、正交相机和柔和三点光照。
- [ ] **Step 4:** 输出 `public/previews/island-internship-final.png` 并与参考图逐项对照。

### Task 6: 优化、导出并接入网页

**Files:**
- Modify: `blender/build_internship_island.py`
- Modify: `scripts/check-internship-model.mjs`
- Modify: `src/viewer.js`
- Output: `public/models/island-internship-final.glb`

**Interfaces:**
- Consumes: `island_internship` Blender 根节点
- Produces: 可由 Three.js 加载的最终 GLB

- [ ] **Step 1:** 清理隐藏几何、合并静态网格并保留独立根节点。
- [ ] **Step 2:** 导出 GLB，并执行 Draco 或 Meshopt 压缩。
- [ ] **Step 3:** 运行 `npm.cmd run check:internship`，确认所有硬性预算通过。
- [ ] **Step 4:** 更新预览器使用 `island-internship-final.glb` 并重新构建前端。
- [ ] **Step 5:** 验证 HTTP 200、中文文案、模型加载和 360° 旋转。
- [ ] **Step 6:** 向用户展示高清预览与单岛查看链接，等待审查后再进入 AI 实践岛。
