import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { createRenderScheduler } from "./render-scheduler.js";

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false, powerPreference: "high-performance" });
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
renderer.setSize(innerWidth, innerHeight);
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.15;
document.body.prepend(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xf2eee7);
scene.add(new THREE.HemisphereLight(0xfff8e8, 0x514b47, 2.4));
const sun = new THREE.DirectionalLight(0xffffff, 3.1);
sun.position.set(-8, 12, 7);
scene.add(sun);

const camera = new THREE.PerspectiveCamera(36, innerWidth / innerHeight, .1, 100);
camera.position.set(13, 11, 16);
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = .065;
controls.minDistance = 4;
controls.maxDistance = 34;
controls.target.set(0, -.2, 0);
controls.update();

const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();
const selectable = new Map();
let root;
let tween = null;
const status = document.querySelector(".status");
const query = new URLSearchParams(location.search);
const previewMode = query.get("preview");
const previewFiles = {
  internship: "./models/island-internship-final.glb",
  ai: "./models/island-ai.glb",
  school: "./models/island-school.glb",
  uploaded: "./models/experience-island-uploaded-preview.glb",
};
const modelFile = previewFiles[previewMode] || "./models/experience-islands.glb";

if (previewMode) {
  document.querySelector("h1").textContent = {
    internship: "实习经历岛 · 单岛验收",
    ai: "AI 实践岛 · 单岛验收",
    school: "学校项目岛 · 单岛验收",
    uploaded: "经历岛 · 原始 GLB 预览",
  }[previewMode];
  document.querySelector("p").textContent = previewMode === "uploaded"
    ? "拖拽旋转 · 滚轮缩放 · 未减面、未重命名的原始模型"
    : "拖拽旋转 · 滚轮缩放 · 单岛模型验收";
  document.querySelector(".buttons").hidden = true;
}

if (previewMode === "uploaded") renderer.toneMappingExposure = .9;

new GLTFLoader().load(modelFile, gltf => {
  root = gltf.scene;
  root.traverse(node => {
    node.castShadow = true;
    node.receiveShadow = true;
    if (node.name.startsWith("island_") && !node.name.includes("_terrain")) selectable.set(node.name, node);
  });
  scene.add(root);
  const rootBounds = boundsOf(root);
  controls.minDistance = Math.max(rootBounds.radius * .85, .5);
  controls.maxDistance = Math.max(rootBounds.radius * 8, 8);
  status.textContent = previewMode === "uploaded"
    ? "优化模型 23 MB / 95.4 万三角面 · 可自由旋转"
    : previewMode
      ? "单岛模型已加载 · 可自由旋转"
      : `模型已加载 · ${selectable.size} 个独立子岛`;
  focus("all", false);
}, progress => {
  if (progress.total) status.textContent = `加载模型 ${Math.round(progress.loaded / progress.total * 100)}%`;
}, error => {
  console.error(error);
  status.textContent = "模型加载失败，请刷新页面重试。";
});

function boundsOf(target) {
  const box = new THREE.Box3().setFromObject(target);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  return { center, size, radius: Math.max(size.x, size.y, size.z) * .66 };
}

function focus(name, animate = true) {
  if (!root) return;
  const targetObject = name === "all" ? root : selectable.get(name);
  if (!targetObject) return;
  const { center, radius } = boundsOf(targetObject);
  const direction = camera.position.clone().sub(controls.target).normalize();
  const destination = center.clone().add(direction.multiplyScalar(Math.max(radius * 2.55, 1.55)));
  tween = {
    start: performance.now(),
    duration: animate ? 780 : 1,
    fromCamera: camera.position.clone(),
    toCamera: destination,
    fromTarget: controls.target.clone(),
    toTarget: center,
  };
  selectable.forEach((island, key) => {
    island.traverse(node => {
      if (!node.isMesh) return;
      node.material.transparent = name !== "all" && key !== name;
      node.material.opacity = name !== "all" && key !== name ? .2 : 1;
      node.material.needsUpdate = true;
    });
  });
  document.querySelectorAll("button").forEach(button => {
    button.classList.toggle("active", button.dataset.focus === name);
  });
  status.textContent = previewMode === "uploaded"
    ? "优化模型 23 MB / 95.4 万三角面 · 可自由旋转"
    : name === "all"
      ? "完整视图 · 可自由旋转"
      : (targetObject.userData.label || name) + " · 独立放大展示";
  requestRender();
}

document.querySelector(".buttons").addEventListener("click", event => {
  const button = event.target.closest("button[data-focus]");
  if (button) focus(button.dataset.focus);
});

renderer.domElement.addEventListener("pointerup", event => {
  if (!root) return;
  pointer.x = event.clientX / innerWidth * 2 - 1;
  pointer.y = -(event.clientY / innerHeight) * 2 + 1;
  raycaster.setFromCamera(pointer, camera);
  const hits = raycaster.intersectObjects([...selectable.values()], true);
  if (!hits.length) return;
  let node = hits[0].object;
  while (node.parent && !selectable.has(node.name)) node = node.parent;
  if (selectable.has(node.name)) focus(node.name);
});

const renderScheduler = createRenderScheduler({
  requestFrame: callback => requestAnimationFrame(callback),
  cancelFrame: frameId => cancelAnimationFrame(frameId),
  renderFrame: time => {
  if (tween) {
    const t = Math.min(1, (time - tween.start) / tween.duration);
    const eased = 1 - Math.pow(1 - t, 3);
    camera.position.lerpVectors(tween.fromCamera, tween.toCamera, eased);
    controls.target.lerpVectors(tween.fromTarget, tween.toTarget, eased);
    if (t === 1) tween = null;
  }
  const controlsChanged = controls.update();
  renderer.render(scene, camera);
  return Boolean(tween || controlsChanged);
  },
});
const requestRender = () => renderScheduler.invalidate();
const syncVisibility = () => document.hidden ? renderScheduler.stop() : renderScheduler.start();
controls.addEventListener("change", requestRender);
document.addEventListener("visibilitychange", syncVisibility);
syncVisibility();

addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
  requestRender();
});
