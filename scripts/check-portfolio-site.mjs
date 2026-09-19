import './check-island-navigation.mjs';
import assert from "node:assert/strict";
import fs from "node:fs/promises";
import { selectFrontIsland } from "../src/experience-island-visibility.js";
import { destinationFrameIndexAtElapsed, directoryFrameIndexForProgress, directoryProgressForScroll, frameIndexForProgress, frameIsForeground, nextSequelLatched, scrollTopFor, sequelFrameIndexAtElapsed } from "../src/home-transition.js";

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

const structure = await fs.readFile("public/site/full-five-page-structure-v8.html", "utf8");
const coveo = await fs.readFile("public/site/full-five-page-coveo-render-v9.html", "utf8");
const reviewed = await fs.readFile("public/site/full-five-page-reviewed-v10.html", "utf8");
assert.match(reviewed, /#experience \.school-project-panel\s*\{[^}]*width:\s*min\(1190px,\s*calc\(100% \+ 280px\)\)/s);
assert.match(reviewed, /#experience \.school-project-head h3\s*\{[^}]*font-size:\s*clamp\(28\.8px,\s*2\.64vw,\s*48px\)/s);
assert.doesNotMatch(structure, /school-project-hint|点击学校子岛部件切换资料/);
assert.match(reviewed, /#resume \.resume-tools\s*\{[^}]*right:\s*-28px;[^}]*top:\s*50%;[^}]*transform:\s*translateY\(-50%\) scale\(\.6\)/s);
assert.match(reviewed, /#resume \.resume-tool span\s*\{\s*display:\s*inline/);
const directoryTransitionFrames = (await fs.readdir("public/assets/directory-transition")).filter(file => /^frame_\d{5}\.webp$/.test(file));
assert.equal(directoryTransitionFrames.length, 60);
const directorySequelFrames = (await fs.readdir("public/assets/directory-sequel")).filter(file => /^frame_\d{6}\.webp$/.test(file));
assert.equal(directorySequelFrames.length, 97);
const destinationTransitionFrames = (await fs.readdir("public/assets/destination-transition")).filter(file => /^frame_\d{5}\.webp$/.test(file));
assert.equal(destinationTransitionFrames.length, 249);
assert.match(structure, /class=["']destination-animation-frame-preview["']/);
assert.match(structure, /src=["']\.\.\/assets\/destination-transition\/frame_00001\.webp["']/);
const destinationPreviewRule = structure.match(/\.destination-animation-frame-preview\s*\{([^}]+)\}/)?.[1] || "";
assert.match(destinationPreviewRule, /width:\s*100%/);
assert.match(destinationPreviewRule, /height:\s*auto/);
assert.match(destinationPreviewRule, /bottom:\s*0/);
assert.match(structure, /class=["']directory-transition-frame-preview["']/);
assert.match(structure, /src=["']\.\.\/assets\/directory-transition\/frame_00001\.webp["']/);
const directoryPreviewRule = structure.match(/\.directory-transition-frame-preview\s*\{([^}]+)\}/)?.[1] || "";
assert.match(directoryPreviewRule, /object-fit:\s*contain/);
assert.match(directoryPreviewRule, /position:\s*absolute/);
assert.match(directoryPreviewRule, /transform:\s*translate\(80px,\s*-50px\)/);
assert.doesNotMatch(index, /\/files\//);
assert.match(index, /data-portfolio-version=["']v11["']/);
assert.match(structure, /id=["']experience["']/);
assert.match(structure, /class=["']destination-title["']>期待<span class=["']destination-title-accent["']>与你<\/span>共同探索未来～</);
const destinationCopyRule = structure.match(/\.destination-copy\s*\{([^}]+)\}/)?.[1] || "";
assert.match(destinationCopyRule, /transform:\s*translate\(-50%,\s*calc\(-50%\s*-\s*30px\)\)/);
const destinationTitleRule = structure.match(/\.destination-title\s*\{([^}]+)\}/)?.[1] || "";
assert.match(destinationTitleRule, /font-size:\s*clamp\(38\.4px,\s*6\.08vw,\s*105\.6px\)/);
assert.match(destinationTitleRule, /white-space:\s*nowrap/);
const destinationTitleAccentRule = structure.match(/\.destination-title-accent\s*\{([^}]+)\}/)?.[1] || "";
assert.match(destinationTitleAccentRule, /color:\s*var\(--accent\)/);
assert.match(coveo, /\.destination-title\s*\{[^}]*max-width:\s*none;[^}]*white-space:\s*nowrap;/s);
assert.match(structure, /\.destination-title\s*\{\s*font-size:\s*clamp\(33\.6px,\s*10\.4vw,\s*59\.2px\);\s*\}/);
assert.match(structure, /class=["']destination-name["']>官晓彤 Gioia</);
assert.match(structure, /VX &amp; PHONE 18100839418 · EMAIL 1042369137@qq\.com/);
assert.match(structure, /\.destination-meta\s*\{[\s\S]*?font:\s*500\s+clamp\(14px,\s*1\.05vw,\s*20px\)\/1\.8/);
assert.match(structure, /\.destination-name\s*\{[\s\S]*?clamp\(24px,\s*1\.8vw,\s*36px\)/);
assert.match(structure, /href=["']\.\.\/assets\/resume-gxt-2026-09-16\.png["'][^>]*download/);
const destinationSection = structure.match(/<section id=["']destination["'][\s\S]*?<\/section>/)?.[0] || "";
assert.doesNotMatch(destinationSection, /AI 产品经理|FROM 浙江/);
assert.doesNotMatch(structure, /class=["']experience-list["']/);
assert.match(structure, /\.resume-document\s*\{[\s\S]*?height:\s*200%/);
assert.match(reviewed, /#resume \.resume-document\s*\{[\s\S]*?transform:\s*translateX\(110px\)\s*scale\(1\.68\)\s*!important/);
assert.match(reviewed, /#resume \.resume-document\s*\{[\s\S]*?transform-origin:\s*center/);
assert.match(reviewed, /#resume \.resume-directory \.section-title\s*\{[\s\S]*?font-size:\s*clamp\(33px,\s*4\.864vw,\s*81px\)\s*!important/);
assert.doesNotMatch(structure, /你目前位于目录页/);
assert.match(structure, /\.directory-list a\.is-current\s*\{[\s\S]*?color:\s*var\(--accent\)/);
assert.match(structure, /\.directory-list a\.is-current::before[\s\S]*?border-left:\s*\d+px solid var\(--accent\)/);
assert.match(structure, /\.school-project-panel\s*\{[\s\S]*?border:\s*0/);
assert.match(structure, /class=["']section-title experience-title["'][\s\S]*?experience-title-prefix["']>我的<[\s\S]*?experience-title-main["']>经历岛</);
assert.match(structure, /class=["']island-label meta["'][\s\S]*?拖动旋转\s*·\s*滚轮缩放[\s\S]*?你当前在[\s\S]*?data-current-island/);
assert.match(structure, /class=["']section-title["']>技能云海</);
assert.match(structure, /欢迎点亮我的技能！/);
assert.match(structure, /class=["']directory-current["']>CURRENT\s*·\s*02\s*\/<\/p>/);
assert.doesNotMatch(structure, /CURRENT\s*·\s*02\s*\/\s*目录页/);
assert.match(reviewed, /#experience \.experience-title\s*\{[\s\S]*?right:/);
assert.match(reviewed, /#experience \.experience-copy\s*\{[\s\S]*?right:\s*calc\(34%\s*-\s*150px\)/);
assert.match(reviewed, /#resume \.resume-directory \.section-title\s*\{[\s\S]*?font-size:\s*clamp\(33px,\s*4\.864vw,\s*81px\)[\s\S]*?font-family:\s*var\(--font-emotional\)/);
assert.match(reviewed, /#experience \.experience-title\s*\{[\s\S]*?font-family:\s*var\(--font-emotional\)/);
assert.match(structure, /\.experience-title-main\s*\{[\s\S]*?color:\s*var\(--accent\)/);
assert.match(reviewed, /#experience \.island-label\s*\{[\s\S]*?transform:\s*translateY\(100px\)/);
assert.match(reviewed, /#experience \.school-project-panel\s*\{[\s\S]*?margin-top:\s*0/);
assert.match(reviewed, /#experience \.experience-title\s*\{[\s\S]*?transform:\s*translateY\(-20px\)/);
assert.match(reviewed, /#resume \.resume-directory > \.section-title\s*\{[\s\S]*?transform:\s*translateY\(-10px\)/);
assert.match(reviewed, /#resume \.directory-list\s*\{[\s\S]*?transform:\s*translateY\(10px\)/);
assert.match(reviewed, /#skills \.skills-heading\s*\{[\s\S]*?transform:\s*translateY\(-10px\)/);
assert.match(structure, /\.island-label-line\s*\{[\s\S]*?font-family:\s*inherit[\s\S]*?font-size:\s*inherit/);

const source = await fs.readFile("src/portfolio-island.js", "utf8");
const projectMesh = key => source.match(new RegExp(`key:\\s*["']${key}["'][\\s\\S]*?meshName:\\s*["']([^"']+)["']`))?.[1];
for (const key of [
  "school-apex", "school-memora", "school-cell-factory",
  "internship-pollo-ai", "internship-qianchuan", "internship-lixiang", "internship-baimi",
  "personal-comfyui", "personal-squirrel-docs", "personal-fullydancy",
]) {
  assert.match(source, new RegExp(`key:\\s*["']${key}["']`));
}
for (const [city, title] of [["上海", "仟传"], ["北京", "理想"], ["杭州", "白米"]]) {
  assert.match(source, new RegExp(`city:\\s*["']${city}["'][\\s\\S]*?title:\\s*["']${title}["']`));
}
assert.match(source, /const EXPERIENCE_PROJECTS\s*=/);
assert.match(source, /function showExperienceProject\(projectKey/);
assert.match(source, /const navigateToIsland\s*=/);
assert.match(source, /const navigateToProject\s*=/);
assert.match(source, /NAVIGATION_DURATION_MS\s*=\s*760/);
const pkg = JSON.parse(await fs.readFile("package.json", "utf8"));
const server = await fs.readFile("scripts/serve.mjs", "utf8");
assert.match(index, /rel=["']preload["'][^>]+experience-island-uploaded-preview\.glb/);
assert.doesNotMatch(index, /loading=["']lazy["']/);
assert.match(index, /portfolio-island\.bundle\.js/);
assert.match(source, /experience-island-uploaded-preview\.glb/);
assert.equal((source.match(/meshName:\s*["'][^"']+["'][\s\S]*?anchor:\s*\{/g) || []).length, 10);
assert.equal(projectMesh("internship-pollo-ai"), "tripo_part_5");
assert.equal(projectMesh("internship-lixiang"), "tripo_part_3");
assert.equal(projectMesh("personal-comfyui"), "tripo_part_0");
assert.equal(projectMesh("personal-fullydancy"), "tripo_part_8");
assert.equal(projectMesh("personal-squirrel-docs"), "tripo_part_9");
assert.equal(projectMesh("school-memora"), "tripo_part_4");
assert.equal(projectMesh("school-apex"), "tripo_part_14");
assert.equal(projectMesh("school-cell-factory"), "tripo_part_4");
assert.match(source, /key:\s*["']school-memora["'][\s\S]*?meshName:\s*["']tripo_part_4["'][\s\S]*?highlightMode:\s*["']component["'][\s\S]*?componentAnchor:\s*\{\s*x:\s*0\.0301,\s*y:\s*0\.4191,\s*z:\s*-0\.2511\s*\}/);
assert.match(source, /key:\s*["']school-cell-factory["'][\s\S]*?meshName:\s*["']tripo_part_4["'][\s\S]*?highlightMode:\s*["']component["'][\s\S]*?componentAnchor:\s*\{\s*x:\s*-0\.0358,\s*y:\s*0\.4256,\s*z:\s*-0\.3058\s*\}/);
assert.match(source, /extractConnectedComponentGeometry/);
assert.match(source, /highlightMode\s*===\s*["']component["'][\s\S]*?new THREE\.EdgesGeometry\(component\.geometry,\s*28\)[\s\S]*?new THREE\.LineBasicMaterial[\s\S]*?new THREE\.LineSegments/);
assert.match(source, /key:\s*["']personal-comfyui["'][\s\S]*?highlightMode:\s*["']local["'][\s\S]*?highlightShape:\s*["']building["']/);
assert.match(source, /category:\s*["']personal["'],\s*anchor:\s*\{\s*x:\s*0\.25,\s*y:\s*0\.12,\s*z:\s*0\.065\s*\}/);
assert.match(source, /category:\s*["']school["'],\s*anchor:\s*\{\s*x:\s*-0\.005,\s*y:\s*0\.12,\s*z:\s*-0\.28\s*\}/);
for (const key of ["personal-comfyui", "personal-squirrel-docs", "personal-fullydancy"]) {
  assert.match(source, new RegExp(`key:\\s*["']${key}["'][\\s\\S]*?enabled:\\s*true`));
}
assert.doesNotMatch(source, /nodeName:\s*["']/);
assert.match(source, /export async function mountExperienceIsland/);
assert.match(source, /enablePan\s*=\s*false/);
assert.match(pkg.scripts["build:site"], /portfolio-island\.js/);
assert.match(index, /\.island-area\.is-3d/);
assert.match(index, /\.island-canvas\s*\{/);
assert.equal((index.match(/data-experience-project=/g) || []).length, 10);
assert.doesNotMatch(index, /box-shadow:\s*0 3px 0 currentColor/);
assert.equal(selectFrontIsland([
  { category: "internship", depth: -2.4 },
  { category: "personal", depth: -1.2 },
  { category: "school", depth: -3.1 },
]), "personal");
// Island stability, collision priorities, and resize behavior are tested in check-island-navigation.mjs.
assert.match(source, /data-front-island/);
assert.match(source, /CURRENT_ISLAND_LABELS/);
assert.match(source, /currentIslandLabel\.textContent\s*=\s*CURRENT_ISLAND_LABELS\[activeCategory\]/);
assert.match(source, /let activeCategory\s*=\s*null/);
assert.match(source, /let selectedProjectKey\s*=\s*null/);
assert.match(source, /let hoveredProjectKey\s*=\s*null/);
assert.match(source, /projectedVisibleProjectKeys/);
assert.doesNotMatch(source, /\bvisibleProjectKeys\b/);
assert.match(source, /navigationMode/);
assert.match(index, /--island-label-dim-opacity/);
assert.match(index, /data-experience-overview/);
assert.match(source, /status\.hidden\s*=\s*true/);
assert.equal((index.match(/data-experience-island=/g) || []).length, 0);
assert.match(index, /\.island-label-anchor\[hidden\]\s*\{\s*display:\s*none/);
assert.doesNotMatch(index, /class=["']island-switcher["']/);
assert.match(source, /intersectObjects\(clickableMeshes,\s*false\)/);
assert.doesNotMatch(source, /distance\s*=\s*0\.14/);
assert.doesNotMatch(source, /focusIsland/);
assert.match(source, /THREE\.BackSide/);
assert.doesNotMatch(source, /THREE\.AdditiveBlending/);
assert.equal((source.match(/scale:\s*1\.018/g) || []).length, 1);
assert.match(source, /transparent:\s*false/);
assert.match(source, /record\.shell\.scale\.setScalar/);
assert.match(source, /highlightMode:\s*["']local["']/);
assert.match(index, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
assert.match(reviewed, /transform:\s*translateX\(110px\)\s*scale\(1\.68\)\s*!important/);
assert.match(reviewed, /transform-origin:\s*center/);
assert.doesNotMatch(structure, /xxx当前分类或经历的具体信息介绍xxx/);
assert.match(structure, /#experience \.section-title\s*\{[\s\S]*?font-size:\s*clamp\(34px,\s*4\.8vw,\s*77px\)/);
assert.match(structure, /\.school-project-media\s*\{[\s\S]*?max-height:\s*none[\s\S]*?overflow:\s*visible/);
assert.match(structure, /\.school-project-media img,[\s\S]*?object-fit:\s*contain/);
const homepage = await fs.readFile("public/site/homepage-viewport-fit-v5.html", "utf8");
const transitionFrames = (await fs.readdir("public/assets/home-to-directory")).filter(file => /^frame_\d{6}\.webp$/.test(file));
assert.equal(transitionFrames.length, 143);
assert.match(homepage, /class=["']home-transition-frame-preview["']/);
assert.match(homepage, /src=["']\.\/assets\/home-to-directory\/frame_000001\.webp["']/);
const transitionPreviewRule = homepage.match(/\.home-transition-frame-preview\s*\{([^}]+)\}/)?.[1] || "";
assert.match(transitionPreviewRule, /object-fit:\s*contain/);
assert.match(transitionPreviewRule, /position:\s*absolute/);
assert.match(transitionPreviewRule, /transform:\s*translateY\(15px\)\s+scale\(1\.05\)/);
assert.match(index, /home-transition\.bundle\.js/);
assert.equal(frameIndexForProgress(0), 1);
assert.equal(frameIndexForProgress(.25), 72);
assert.equal(frameIndexForProgress(.5), 143);
assert.equal(frameIndexForProgress(1), 143);
assert.equal(directoryFrameIndexForProgress(0), 1);
assert.equal(directoryFrameIndexForProgress(1 / 12), 31);
assert.equal(directoryFrameIndexForProgress(1 / 6), 60);
assert.equal(directoryFrameIndexForProgress(1), 60);
assert.equal(directoryProgressForScroll(500, 1000), 0);
assert.equal(directoryProgressForScroll(750, 1000), .25);
assert.equal(directoryProgressForScroll(1000, 1000), .5);
assert.equal(sequelFrameIndexAtElapsed(0), 1);
assert.equal(sequelFrameIndexAtElapsed(34), 2);
assert.equal(sequelFrameIndexAtElapsed(3300), 97);
assert.equal(sequelFrameIndexAtElapsed(4260), 1);
assert.equal(nextSequelLatched(false, .16), false);
assert.equal(nextSequelLatched(false, 1 / 6), true);
assert.equal(nextSequelLatched(true, .2), true);
assert.equal(nextSequelLatched(true, 0), false);
assert.equal(nextSequelLatched(true, .00025), false);
assert.equal(destinationFrameIndexAtElapsed(0), 1);
assert.equal(destinationFrameIndexAtElapsed(67), 2);
assert.equal(destinationFrameIndexAtElapsed(16550), 249);
assert.equal(destinationFrameIndexAtElapsed(16610), 1);
assert.equal(frameIsForeground(.12), false);
assert.equal(frameIsForeground(1 / 8), true);
assert.equal(scrollTopFor({ scrollTop: 720 }, { scrollY: 0 }), 720);
assert.match(homepage, /@keyframes\s+orbit-clockwise/);
assert.match(homepage, /\.orbit:hover \.tile\s*\{[\s\S]*?animation-play-state:\s*paused/);
assert.match(homepage, /\.tile:hover\s*\{[\s\S]*?animation:[^;}]*tile-sway/);
assert.match(homepage, /@keyframes\s+tile-sway[\s\S]*?3deg[\s\S]*?2\.4deg/);
assert.match(homepage, /\.orbit:hover \.tile:hover\s*\{[\s\S]*?animation-play-state:\s*paused,\s*running/);
assert.match(homepage, /function\s+alignOrbitToPortrait/);
assert.match(homepage, /contactRect\.bottom\s*\+\s*5/);
assert.doesNotMatch(homepage, /\.orbit\s*\{[\s\S]*?mask-image:/);
assert.match(homepage, /\.page::after\s*\{[\s\S]*?linear-gradient\(to bottom/);
assert.match(homepage, /--orbit-mask-top/);
assert.match(homepage, /offset-path:\s*ellipse\(calc\(47% - 55px\) calc\(47% - 55px\)/);
assert.doesNotMatch(homepage, /clip-path:\s*inset/);
assert.match(homepage, /fullHeight\s*=\s*visibleRadius\s*\*\s*3\.3/);
assert.match(homepage, /--orbit-mask-top["'],\s*`\$\{lowerEdge\s*-\s*18\}px`/);
assert.match(index, /function\s+alignHomepageOrbit/);
assert.match(index, /fullHeight\s*=\s*visibleRadius\s*\*\s*3\.3/);
assert.match(index, /@media\s*\(max-width:\s*760px\)/);
assert.match(source, /document\.hidden/);
assert.match(source, /webgl-unavailable/);
assert.match(source, /island-retry/);
assert.match(source, /updateProjectLabels/);
assert.match(source, /\.project\(camera\)/);
assert.match(source, /controls\.addEventListener\(["']change["'],\s*requestRender\)/);
assert.match(source, /new IntersectionObserver/);
assert.match(server, /pathname\s*===\s*["\']\/["\']\s*\?\s*["\']\/index\.html["\']/);

console.log(JSON.stringify({ status: "PASS", checks: "stable V11 shell and embedded island" }, null, 2));
