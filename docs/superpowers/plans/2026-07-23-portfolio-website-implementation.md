# AI 产品经理个人作品集网站实施计划

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 构建一个中文单页个人作品集网站，通过自然滚动串联启程、简历、经历岛、技能云海和抵达终点五个章节。

**Architecture:** 使用 React + TypeScript + Vite 构建前端，内容集中存放在类型安全的数据文件中。GSAP 与 ScrollTrigger 负责滚动叙事，经历岛和技能云海保持为独立组件；CSS 自定义属性负责设计令牌和响应式布局。最终实习与项目详情未确定，因此第一版只实现确定的信息分类、交互容器和可替换的数据接口。

**Tech Stack:** React、TypeScript、Vite、GSAP、Vitest、Testing Library、Playwright、CSS Modules

## Global Constraints

- 网站内容语言为中文。
- 网站由启程页、简历页、经历岛、技能云海和抵达终点五个连续章节组成。
- 页面以自然向下滚动驱动叙事，不设置“开始探索”按钮。
- 姓名、联系方式和 PDF 简历下载入口始终悬浮在页面右上角。
- 纸飞机保持普通纸张形态，不增加驾驶舱、机械结构或科技光带。
- 经历岛包含实习经历 40%、学校项目 20%、个人 AI 实践 40% 三个区域。
- 经历岛约占对应页面画幅的 30%。
- 小女孩和纸飞机在经历岛浏览阶段位置固定，经历岛可旋转。
- 前方子岛略微放大，成为当前选中区域。
- 技能条不表示百分比或熟练度。
- 重要内容不能只存在于动画中。
- 移动端保留完整核心信息，但允许简化角色与空间动画。
- 必须提供 `prefers-reduced-motion` 降级体验。

---

## 文件结构

```text
portfolio_home/
├─ public/
│  ├─ assets/
│  │  ├─ character/
│  │  ├─ experience/
│  │  └─ clouds/
│  └─ resume.pdf
├─ src/
│  ├─ app/
│  │  ├─ App.tsx
│  │  └─ App.module.css
│  ├─ components/
│  │  ├─ FloatingIdentity/
│  │  ├─ JourneyCharacter/
│  │  ├─ ExperienceIsland/
│  │  ├─ ExperiencePanel/
│  │  ├─ SkillCloud/
│  │  └─ ReducedMotionNotice/
│  ├─ sections/
│  │  ├─ DepartureSection/
│  │  ├─ ResumeSection/
│  │  ├─ ExperienceSection/
│  │  ├─ SkillsSection/
│  │  └─ ContactSection/
│  ├─ content/
│  │  └─ portfolio.ts
│  ├─ hooks/
│  │  ├─ useReducedMotion.ts
│  │  └─ useJourneyTimeline.ts
│  ├─ styles/
│  │  ├─ tokens.css
│  │  ├─ reset.css
│  │  └─ global.css
│  ├─ test/
│  │  └─ setup.ts
│  └─ main.tsx
├─ e2e/
│  └─ journey.spec.ts
├─ index.html
├─ package.json
├─ playwright.config.ts
├─ tsconfig.json
└─ vite.config.ts
```

---

### Task 1：建立可测试的前端项目骨架

**Files:**
- Create: `package.json`
- Create: `vite.config.ts`
- Create: `tsconfig.json`
- Create: `index.html`
- Create: `src/main.tsx`
- Create: `src/app/App.tsx`
- Create: `src/test/setup.ts`
- Create: `src/app/App.test.tsx`

**Interfaces:**
- Produces: React 应用入口与 `App` 根组件。
- Produces: `npm run dev`、`npm run test`、`npm run build`、`npm run e2e`。

- [ ] **Step 1: 初始化 Vite React TypeScript 项目并安装依赖**

```powershell
npm create vite@latest . -- --template react-ts
npm install
npm install gsap
npm install -D vitest jsdom @testing-library/react @testing-library/jest-dom @playwright/test
```

- [ ] **Step 2: 配置 Vitest**

在 `vite.config.ts` 中加入：

```ts
/// <reference types="vitest" />
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
  },
});
```

- [ ] **Step 3: 编写根组件失败测试**

```tsx
import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "./App";

describe("App", () => {
  it("renders all five journey sections", () => {
    render(<App />);
    for (const name of ["启程", "简历", "经历岛", "技能云海", "抵达终点"]) {
      expect(screen.getByRole("region", { name })).toBeInTheDocument();
    }
  });
});
```

- [ ] **Step 4: 运行测试并确认失败**

```powershell
npm test -- --run
```

Expected: FAIL，因为五个章节尚未创建。

- [ ] **Step 5: 创建最小根组件和五个语义章节**

`App.tsx` 暂时输出五个带 `aria-label` 的 `<section>`，确保文档结构成立。

- [ ] **Step 6: 运行测试和构建**

```powershell
npm test -- --run
npm run build
```

Expected: 所有测试通过，Vite 构建成功。

- [ ] **Step 7: 提交**

```powershell
git add package.json package-lock.json vite.config.ts tsconfig.json index.html src
git commit -m "chore: scaffold portfolio application"
```

---

### Task 2：建立内容模型和设计令牌

**Files:**
- Create: `src/content/portfolio.ts`
- Create: `src/styles/tokens.css`
- Create: `src/styles/reset.css`
- Create: `src/styles/global.css`
- Create: `src/content/portfolio.test.ts`
- Modify: `src/main.tsx`

**Interfaces:**
- Produces: `PortfolioContent`、`ExperienceCategory`、`SkillItem` 类型。
- Produces: `portfolioContent` 单一内容源。
- Produces: 全站颜色、间距、圆角、排版、动效与布局 CSS 变量。

- [ ] **Step 1: 为内容结构编写失败测试**

验证三类经历的权重分别为 `40/20/40`，技能条不包含百分比字段，网站语言为中文。

- [ ] **Step 2: 运行测试并确认失败**

```powershell
npm test -- --run src/content/portfolio.test.ts
```

- [ ] **Step 3: 定义内容类型和当前已确认数据**

```ts
export type ExperienceCategoryId = "internship" | "school" | "ai-practice";

export interface ExperienceCategory {
  id: ExperienceCategoryId;
  label: string;
  weight: 20 | 40;
  summary: string;
}

export interface SkillItem {
  id: string;
  label: string;
  description: string;
  relatedExperienceIds: ExperienceCategoryId[];
}

export interface PortfolioContent {
  language: "zh-CN";
  identity: {
    name: string;
    role: string;
    phone: string;
    wechat: string;
    email: string;
    resumeUrl: string;
  };
  experiences: ExperienceCategory[];
  skills: SkillItem[];
}
```

内容文件只写入已确认的信息；未确认的实习公司、项目名称和详情不伪造。

- [ ] **Step 4: 建立基础设计令牌**

令牌以 COVEO 的克制中性色、轻边框、少阴影和大留白为参考，但强调色保留为可替换变量。

- [ ] **Step 5: 运行测试**

```powershell
npm test -- --run src/content/portfolio.test.ts
```

- [ ] **Step 6: 提交**

```powershell
git add src/content src/styles src/main.tsx
git commit -m "feat: add portfolio content model and design tokens"
```

---

### Task 3：实现固定身份栏与全站导航

**Files:**
- Create: `src/components/FloatingIdentity/FloatingIdentity.tsx`
- Create: `src/components/FloatingIdentity/FloatingIdentity.module.css`
- Create: `src/components/FloatingIdentity/FloatingIdentity.test.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `portfolioContent.identity`
- Produces: `<FloatingIdentity identity={identity} />`

- [ ] **Step 1: 编写失败测试**

测试姓名、电话、微信、邮箱和 PDF 链接全部可访问；PDF 链接使用 `/resume.pdf`，并带有明确可访问名称。

- [ ] **Step 2: 运行测试并确认失败**

```powershell
npm test -- --run src/components/FloatingIdentity/FloatingIdentity.test.tsx
```

- [ ] **Step 3: 实现组件**

桌面端固定在右上角，移动端折叠为姓名、联系方式按钮和“简历 PDF”短链接。使用 `position: fixed`，建立语义化 z-index 令牌。

- [ ] **Step 4: 验证键盘与响应式样式**

```powershell
npm test -- --run
npm run build
```

- [ ] **Step 5: 提交**

```powershell
git add src/components/FloatingIdentity src/app/App.tsx
git commit -m "feat: add persistent identity and resume controls"
```

---

### Task 4：实现启程页与简历页静态结构

**Files:**
- Create: `src/sections/DepartureSection/DepartureSection.tsx`
- Create: `src/sections/DepartureSection/DepartureSection.module.css`
- Create: `src/sections/ResumeSection/ResumeSection.tsx`
- Create: `src/sections/ResumeSection/ResumeSection.module.css`
- Create: `src/components/JourneyCharacter/JourneyCharacter.tsx`
- Create: `src/components/JourneyCharacter/JourneyCharacter.module.css`
- Create: `src/sections/DepartureSection/DepartureSection.test.tsx`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Produces: `<JourneyCharacter phase="photo" | "character" | "plane" | "falling" | "cloud" />`
- Produces: `#departure` 和 `#resume` 章节。

- [ ] **Step 1: 编写启程页失败测试**

验证首屏包含照片、姓名、自我介绍、求职方向和联系方式；不存在“开始探索”按钮。

- [ ] **Step 2: 运行测试并确认失败**

```powershell
npm test -- --run src/sections/DepartureSection/DepartureSection.test.tsx
```

- [ ] **Step 3: 实现无动画的完整默认状态**

内容在 JavaScript 和动画失效时仍然可见。纸飞机使用独立图片或 SVG 资源，不在代码中绘制复杂草图。

- [ ] **Step 4: 实现简历页容器**

简历页提供清晰的内容插槽，数据来自 `portfolioContent`；不创建沿途信息节点。

- [ ] **Step 5: 运行测试与构建**

```powershell
npm test -- --run
npm run build
```

- [ ] **Step 6: 提交**

```powershell
git add src/sections/DepartureSection src/sections/ResumeSection src/components/JourneyCharacter src/app/App.tsx
git commit -m "feat: add departure and resume sections"
```

---

### Task 5：实现经历岛选择系统

**Files:**
- Create: `src/components/ExperienceIsland/ExperienceIsland.tsx`
- Create: `src/components/ExperienceIsland/ExperienceIsland.module.css`
- Create: `src/components/ExperienceIsland/ExperienceIsland.test.tsx`
- Create: `src/components/ExperiencePanel/ExperiencePanel.tsx`
- Create: `src/components/ExperiencePanel/ExperiencePanel.module.css`
- Create: `src/sections/ExperienceSection/ExperienceSection.tsx`
- Create: `src/sections/ExperienceSection/ExperienceSection.module.css`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `ExperienceCategory[]`
- Produces: `<ExperienceIsland categories selectedId onSelect />`
- Produces: `<ExperiencePanel category />`

- [ ] **Step 1: 编写状态切换失败测试**

初始选中实习经历；点击学校项目后，学校项目成为前方子岛且详情标题更新；键盘左右方向键可以轮换三个子岛。

- [ ] **Step 2: 运行测试并确认失败**

```powershell
npm test -- --run src/components/ExperienceIsland/ExperienceIsland.test.tsx
```

- [ ] **Step 3: 实现三子岛状态机**

使用数组索引和 `selectedId` 控制旋转顺序，不把具体实习详情写死在组件中。

- [ ] **Step 4: 实现桌面布局**

左侧详情约占主要内容区域，右侧经历岛约占页面画幅 30%；小女孩和纸飞机位置固定。

- [ ] **Step 5: 实现移动布局**

移动端改为上方选择器、下方详情；保留点击和方向键，不强制使用复杂三维拖拽。

- [ ] **Step 6: 运行测试与构建**

```powershell
npm test -- --run
npm run build
```

- [ ] **Step 7: 提交**

```powershell
git add src/components/ExperienceIsland src/components/ExperiencePanel src/sections/ExperienceSection src/app/App.tsx
git commit -m "feat: add interactive experience island"
```

---

### Task 6：实现技能云海与资料卡

**Files:**
- Create: `src/components/SkillCloud/SkillCloud.tsx`
- Create: `src/components/SkillCloud/SkillCloud.module.css`
- Create: `src/components/SkillCloud/SkillCloud.test.tsx`
- Create: `src/sections/SkillsSection/SkillsSection.tsx`
- Create: `src/sections/SkillsSection/SkillsSection.module.css`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Consumes: `SkillItem[]`
- Produces: `<SkillCloud skills selectedId onSelect />`

- [ ] **Step 1: 编写失败测试**

验证全部技能均以按钮呈现；点击技能后显示资料卡；组件中不存在百分比、`progressbar` 或熟练度数值。

- [ ] **Step 2: 运行测试并确认失败**

```powershell
npm test -- --run src/components/SkillCloud/SkillCloud.test.tsx
```

- [ ] **Step 3: 实现技能条与资料卡**

技能条可任意顺序点击，资料卡通过 `aria-live="polite"` 更新，并列出关联经历分类。

- [ ] **Step 4: 实现云海构图**

大云团位于页面下方，小女孩处于舒适躺卧状态；技能条漂浮于云团上方，但默认内容始终可见。

- [ ] **Step 5: 运行测试与构建**

```powershell
npm test -- --run
npm run build
```

- [ ] **Step 6: 提交**

```powershell
git add src/components/SkillCloud src/sections/SkillsSection src/app/App.tsx
git commit -m "feat: add interactive skill cloud"
```

---

### Task 7：实现终点页与滚动叙事

**Files:**
- Create: `src/sections/ContactSection/ContactSection.tsx`
- Create: `src/sections/ContactSection/ContactSection.module.css`
- Create: `src/hooks/useReducedMotion.ts`
- Create: `src/hooks/useJourneyTimeline.ts`
- Create: `src/hooks/useReducedMotion.test.ts`
- Modify: `src/app/App.tsx`

**Interfaces:**
- Produces: `useReducedMotion(): boolean`
- Produces: `useJourneyTimeline(root: RefObject<HTMLElement>): void`

- [ ] **Step 1: 编写 reduced-motion 失败测试**

模拟 `matchMedia("(prefers-reduced-motion: reduce)")`，验证 Hook 返回 `true`。

- [ ] **Step 2: 运行测试并确认失败**

```powershell
npm test -- --run src/hooks/useReducedMotion.test.ts
```

- [ ] **Step 3: 实现 reduced-motion Hook**

监听媒体查询变化，并在组件卸载时清理事件监听。

- [ ] **Step 4: 实现 ContactSection**

包含结束语、求职意向、电话、微信、邮箱、PDF 下载、返回经历岛和重新开始旅程。

- [ ] **Step 5: 实现 GSAP 时间线**

时间线只负责：照片转数字角色、纸张折成纸飞机、纸飞机进入简历与经历岛、女孩向下坠落、落入云团、穿云到终点。组件选择状态不由时间线管理。

- [ ] **Step 6: 实现降级体验**

reduced-motion 下取消旋转、坠落和漂浮，改为即时状态切换与淡入。

- [ ] **Step 7: 运行全部单元测试与构建**

```powershell
npm test -- --run
npm run build
```

- [ ] **Step 8: 提交**

```powershell
git add src/sections/ContactSection src/hooks src/app/App.tsx
git commit -m "feat: add journey timeline and contact destination"
```

---

### Task 8：端到端、响应式和可访问性验收

**Files:**
- Create: `playwright.config.ts`
- Create: `e2e/journey.spec.ts`
- Modify: relevant component styles only when tests expose defects

**Interfaces:**
- Consumes: 完整应用。
- Produces: 桌面和移动端端到端验收。

- [ ] **Step 1: 编写桌面端 E2E 测试**

验证五个章节均存在、右上角身份栏固定、经历岛可选择三类经历、技能条可打开资料卡、终点联系方式可访问。

- [ ] **Step 2: 编写移动端 E2E 测试**

使用 `390 × 844` 视口，验证没有水平滚动、身份栏不遮挡标题、经历详情可读、全部操作目标可点击。

- [ ] **Step 3: 编写 reduced-motion E2E 测试**

模拟减少动态效果，验证五个章节和全部关键信息仍然可见。

- [ ] **Step 4: 运行 E2E 并修复失败**

```powershell
npx playwright install chromium
npm run e2e
```

Expected: 桌面、移动与 reduced-motion 用例全部通过。

- [ ] **Step 5: 运行最终验证**

```powershell
npm test -- --run
npm run build
npm run e2e
```

Expected: 单元测试通过、生产构建成功、端到端测试通过。

- [ ] **Step 6: 提交**

```powershell
git add playwright.config.ts e2e src
git commit -m "test: verify responsive portfolio journey"
```

---

## 实施前所需素材

实施可以先使用结构化占位资源完成布局，但进入视觉验收前需要提供：

1. 个人照片
2. 数字化小女孩最终形象
3. 纸飞机素材
4. 三个经历子岛素材
5. 云海与躺卧女孩素材
6. PDF 简历
7. 最终姓名和自我介绍
8. 实习、学校项目和个人 AI 实践的实际内容
9. 技能及其关联经历
10. 终点场景素材

结构实现不得伪造公司、项目、成果或数据；素材未到位时只使用明确标识为演示内容的本地测试 fixture。

