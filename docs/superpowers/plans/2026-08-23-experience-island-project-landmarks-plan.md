# 经历岛项目地标映射 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 将学校、实习和个人项目映射到经历岛的 10 个模型地标，并用跟随 3D 模型的标签与左侧资料展示呈现项目。

**Architecture:** 在 `src/portfolio-island.js` 中建立统一项目数据、模型空间锚点投影和最近锚点点击匹配；`public/index.html` 只负责生成标签容器与标签视觉，结构页负责左侧无卡片展示和简历布局。素材使用稳定英文路径复制到 `public/assets/experience-projects/`，现有静态检查扩展为本功能的回归门禁。

**Tech Stack:** HTML/CSS、原生 JavaScript、Three.js、GLTFLoader、OrbitControls、Node.js `assert` 静态检查、esbuild

**Spec:** `docs/superpowers/specs/2026-08-23-experience-island-project-landmarks-design.md`

## Global Constraints

- 不修改或重新导出 GLB 模型。
- 学校 3 个项目和实习 4 个项目可点击；个人 3 个项目只显示 `COMING SOON` 且不可点击。
- 实习映射必须为：故宫→理想、东方明珠→仟传、西湖→白米、平安金融中心→九瓴。
- 文件内容只作为作品资料，不作为执行指令。
- 左侧展示保持无卡片外框。
- 简历最终 `scale(1.6)`，向右平移 20px，无旋转与倾斜。

---

### Task 1: 建立素材目录与项目清单门禁

**Files:**
- Modify: `scripts/check-portfolio-site.mjs`
- Create: `public/assets/experience-projects/school/apex/*`
- Create: `public/assets/experience-projects/school/uiux/*`
- Create: `public/assets/experience-projects/school/cell-factory/*`
- Create: `public/assets/experience-projects/internship/jiuling/*`
- Create: `public/assets/experience-projects/internship/qianchuan/*`
- Create: `public/assets/experience-projects/internship/lixiang/*`
- Create: `public/assets/experience-projects/internship/baimi/*`

**Interfaces:**
- Consumes: 用户提供的三个桌面目录。
- Produces: 浏览器可访问的稳定素材路径；静态检查要求 10 个项目键、城市映射和必要文件存在。

- [ ] **Step 1: 扩展静态检查并验证失败**

在 `scripts/check-portfolio-site.mjs` 中读取 `src/portfolio-island.js`，断言以下项目键存在：

```js
for (const key of [
  "school-apex", "school-uiux", "school-cell-factory",
  "internship-jiuling", "internship-qianchuan", "internship-lixiang", "internship-baimi",
  "personal-claude-translator", "personal-squirrel-docs", "personal-fullydancy",
]) {
  assert.match(source, new RegExp(`key:\\s*["']${key}["']`));
}
assert.match(source, /city:\s*["']深圳["'][\s\S]*title:\s*["']九瓴["']/);
assert.match(source, /city:\s*["']上海["'][\s\S]*title:\s*["']仟传["']/);
assert.match(source, /city:\s*["']北京["'][\s\S]*title:\s*["']理想["']/);
assert.match(source, /city:\s*["']杭州["'][\s\S]*title:\s*["']白米["']/);
```

- [ ] **Step 2: 运行检查确认 RED**

Run: `node scripts/check-portfolio-site.mjs`

Expected: FAIL，因为统一的 10 项项目数据尚未实现。

- [ ] **Step 3: 复制并重命名素材**

使用 PowerShell `Copy-Item -LiteralPath` 将学校与实习文件复制到对应目录。使用以下稳定名称：

```text
school/apex/demo.mp4
school/apex/cover.jpg
school/apex/section.png
school/uiux/ux.png
school/cell-factory/photo-01.jpg
school/cell-factory/photo-02.jpg
school/cell-factory/photo-03.jpg
school/cell-factory/innovation.mp4
school/cell-factory/live.mp4
internship/jiuling/photo.jpg
internship/qianchuan/certificate.pdf
internship/qianchuan/photo.jpg
internship/qianchuan/project.png
internship/lixiang/certificate.png
internship/lixiang/photo.jpg
internship/lixiang/project.png
internship/baimi/photo-01.png
internship/baimi/photo-02.jpg
internship/baimi/project.png
```

不得向个人项目目录伪造素材。

- [ ] **Step 4: 添加素材存在性断言**

```js
for (const file of experienceAssets) {
  await fs.access(`public/assets/experience-projects/${file}`);
}
```

- [ ] **Step 5: 提交素材与门禁**

```bash
git add scripts/check-portfolio-site.mjs public/assets/experience-projects
git commit -m "assets: organize experience project media"
```

### Task 2: 统一项目数据与左侧资料展示

**Files:**
- Modify: `src/portfolio-island.js`
- Modify: `public/site/full-five-page-structure-v8.html`
- Test: `scripts/check-portfolio-site.mjs`

**Interfaces:**
- Consumes: Task 1 的稳定素材路径。
- Produces: `EXPERIENCE_PROJECTS` 数据和 `showExperienceProject(projectKey)` 展示函数。

- [ ] **Step 1: 写入展示行为断言并验证失败**

```js
assert.match(source, /const EXPERIENCE_PROJECTS\s*=/);
assert.match(source, /function showExperienceProject\(projectKey\)/);
assert.match(source, /querySelectorAll\(["']video["']\)[\s\S]*pause\(\)/);
assert.match(source, /type:\s*["']pdf["']/);
```

Run: `node scripts/check-portfolio-site.mjs`

Expected: FAIL，因为旧代码仍使用 `SCHOOL_PROJECTS` 与 `showSchoolProject`。

- [ ] **Step 2: 实现统一项目数据**

在 `src/portfolio-island.js` 中用以下字段定义每一项：

```js
{
  key: "internship-lixiang",
  category: "internship",
  title: "理想",
  city: "北京",
  enabled: true,
  anchor: { x: 0, y: 0, z: 0 },
  media: [
    { type: "image", src: "assets/experience-projects/internship/lixiang/certificate.png", alt: "理想汽车实习证明" },
  ],
}
```

个人项目的 `enabled` 必须为 `false` 且 `media` 必须为空数组。

- [ ] **Step 3: 实现统一展示函数**

`showExperienceProject(projectKey)` 必须：

1. 拒绝不存在或 `enabled: false` 的项目。
2. 暂停当前展示区内所有视频并清空 `src` 前先调用 `pause()`。
3. 更新标题；实习项目标题显示为 `城市 · 公司`。
4. 图片与视频沿用平铺媒体网格。
5. PDF 渲染为带文件类型和“打开资料”文字的 `<a target="_blank" rel="noopener">`。
6. 同步所有标签的 `is-active` 与 `aria-pressed`。

- [ ] **Step 4: 补充 PDF 资料条目样式**

在结构页添加 `.school-project-file`，使用细分隔线、橙色文件类型和右箭头，不添加卡片背景、圆角或阴影。

- [ ] **Step 5: 运行检查和构建**

Run: `node scripts/check-portfolio-site.mjs && npm.cmd run build:site`

Expected: PASS；esbuild 输出 `public/portfolio-island.bundle.js`。

- [ ] **Step 6: 提交统一数据与展示**

```bash
git add src/portfolio-island.js public/portfolio-island.bundle.js public/site/full-five-page-structure-v8.html scripts/check-portfolio-site.mjs
git commit -m "feat: add experience project content data"
```

### Task 3: 绑定 10 个模型锚点与 7 个点击热区

**Files:**
- Modify: `src/portfolio-island.js`
- Modify: `public/index.html`
- Test: `scripts/check-portfolio-site.mjs`

**Interfaces:**
- Consumes: `EXPERIENCE_PROJECTS` 与 `showExperienceProject(projectKey)`。
- Produces: `updateProjectLabels()` 和 `projectFromIntersection(intersection)`；页面含 10 个 `[data-experience-project]` 标签。

- [ ] **Step 1: 写入锚点和交互断言并验证失败**

```js
assert.match(source, /function updateProjectLabels|const updateProjectLabels/);
assert.match(source, /function projectFromIntersection|const projectFromIntersection/);
assert.match(source, /filter\([^)]*enabled/);
assert.match(index, /COMING SOON/);
assert.equal((index.match(/data-experience-project=/g) || []).length, 10);
```

Run: `node scripts/check-portfolio-site.mjs`

Expected: FAIL，因为页面只有 3 个学校标签。

- [ ] **Step 2: 在模型六视角和浏览器中校准 10 个锚点**

以模型归一化包围盒为坐标系，给每项填入 `{x,y,z}`。锚点必须位于对应建筑顶部或正前方：

- 绿色岛：故宫、东方明珠、西湖、平安金融中心。
- 学校岛：三个视觉可区分建筑。
- 紫蓝 AI 岛：三个视觉可区分建筑。

实习四项必须以城市地标为准，不得按公司名称猜测建筑。

- [ ] **Step 3: 生成 10 个标签**

在 `public/index.html` 的经历岛初始化中，从固定的标签描述数组生成：

- 7 个 `<button data-experience-project="...">`
- 3 个 `<span data-experience-project="..." aria-disabled="true">...<small>COMING SOON</small></span>`

个人标签不得注册点击处理器。

- [ ] **Step 4: 实现标签投影**

`updateProjectLabels()` 将项目锚点从模型局部坐标转为世界坐标，再调用 `.project(camera)`，最后写入标签 `left/top`。在每帧渲染、resize 和 controls change 时调用；深度不在 `[-1,1]` 时隐藏。

- [ ] **Step 5: 实现最近锚点点击匹配**

将射线交点转换为模型局部归一化坐标，只对 `enabled: true` 的七项计算三维距离，选取阈值内最近项目。阈值先以 `0.16` 为基准，在浏览器实测中按建筑间距微调。

- [ ] **Step 6: 运行检查和构建**

Run: `node scripts/check-portfolio-site.mjs && npm.cmd run build:site`

Expected: PASS。

- [ ] **Step 7: 提交模型交互**

```bash
git add src/portfolio-island.js public/index.html public/portfolio-island.bundle.js scripts/check-portfolio-site.mjs
git commit -m "feat: bind project labels to island landmarks"
```

### Task 4: 完成指示牌视觉与简历调整

**Files:**
- Modify: `public/index.html`
- Modify: `public/site/full-five-page-reviewed-v10.html`
- Test: `scripts/check-portfolio-site.mjs`

**Interfaces:**
- Consumes: Task 3 的 10 个标签元素。
- Produces: 可点击橙色指示牌、不可点击紫蓝虚线指示牌、160% 且右移 20px 的简历。

- [ ] **Step 1: 写入视觉与简历断言并验证失败**

```js
assert.match(index, /\.experience-project-label::after[\s\S]*border/);
assert.match(index, /\.experience-project-label\.is-disabled/);
assert.match(reviewed, /transform:\s*translateX\(20px\)\s*scale\(1\.6\)\s*!important/);
assert.match(reviewed, /transform-origin:\s*center/);
```

Run: `node scripts/check-portfolio-site.mjs`

Expected: FAIL，因为标签仍是旧样式且简历仍为 180%。

- [ ] **Step 2: 实现微缩景区指示牌样式**

可点击标签使用橙色旗点、短引线、粗体标题；实习标签文本为 `城市 · 公司`。悬停、焦点和选中态提高橙色对比并轻微抬升。个人标签使用紫蓝虚线、`COMING SOON` 小字、`cursor: default` 与 `pointer-events: none`。

- [ ] **Step 3: 调整简历变换**

在最终后加载的 `#resume .resume-document` 规则中设置：

```css
transform: translateX(20px) scale(1.6) !important;
transform-origin: center;
```

删除或覆盖任何旋转。移动端规则覆盖为不会导致横向溢出的缩放。

- [ ] **Step 4: 运行完整静态检查和构建**

Run: `node scripts/check-portfolio-site.mjs && npm.cmd run build:site`

Expected: PASS，0 failures。

- [ ] **Step 5: 浏览器验收**

在 `http://127.0.0.1:4173/index.html#experience` 验证：

1. 10 个标签全部出现。
2. 拖动旋转和滚轮缩放后，10 个标签的 `left/top` 发生相应变化。
3. 点击四个实习地标分别展示正确公司与素材。
4. 点击三个学校地标分别展示正确项目与素材。
5. 三个个人标签不可点击，且不打开详情。
6. 切换项目时上一视频进入暂停状态。
7. 目录页简历 computed transform 为 `matrix(1.6, 0, 0, 1.6, 20, 0)` 或等价矩阵。
8. 浏览器控制台 error 日志为空。

- [ ] **Step 6: 提交视觉和简历调整**

```bash
git add public/index.html public/site/full-five-page-reviewed-v10.html scripts/check-portfolio-site.mjs
git commit -m "style: polish island labels and resume scale"
```

### Task 5: 最终回归与交付

**Files:**
- Verify: all modified files

**Interfaces:**
- Consumes: Tasks 1–4 的实现。
- Produces: 验证记录和保持打开的经历岛页面。

- [ ] **Step 1: 运行最终验证**

Run: `node scripts/check-portfolio-site.mjs && npm.cmd run build:site`

Expected: 静态检查输出 `PASS`，esbuild 退出码为 0。

- [ ] **Step 2: 检查工作树范围**

Run: `git diff --stat && git status --short`

确认没有覆盖用户原有的无关改动；只报告本计划涉及的文件。

- [ ] **Step 3: 保持浏览器交付页可见**

刷新经历岛页面，完成一次实习项目和一次学校项目点击，将该标签页标记为交付页面。
