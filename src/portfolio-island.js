import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { experienceIslandZoomRange } from "./experience-island-zoom.js";

const MODEL_URL = "./models/experience-island-uploaded-preview.glb";
let activeMount = null;

const EXPERIENCE_PROJECTS = [
  { key: "internship-lixiang", category: "internship", city: "北京", title: "理想", enabled: true, landmark: "故宫", anchor: { x: 0.18, y: 0.78, z: 0.66 }, media: [
    { type: "image", src: "assets/experience-projects/internship/lixiang/certificate.png", alt: "理想汽车实习证明" },
    { type: "image", src: "assets/experience-projects/internship/lixiang/photo.jpg", alt: "理想汽车项目照片" },
    { type: "image", src: "assets/experience-projects/internship/lixiang/project.png", alt: "理想汽车项目资料" },
  ] },
  { key: "internship-qianchuan", category: "internship", city: "上海", title: "仟传", enabled: true, landmark: "东方明珠", anchor: { x: 0.31, y: 0.74, z: 0.62 }, media: [
    { type: "pdf", src: "assets/experience-projects/internship/qianchuan/certificate.pdf", alt: "仟传实习证明" },
    { type: "image", src: "assets/experience-projects/internship/qianchuan/photo.jpg", alt: "仟传项目照片" },
    { type: "image", src: "assets/experience-projects/internship/qianchuan/project.png", alt: "仟传项目资料" },
  ] },
  { key: "internship-baimi", category: "internship", city: "杭州", title: "白米", enabled: true, landmark: "西湖", anchor: { x: 0.25, y: 0.58, z: 0.72 }, media: [
    { type: "image", src: "assets/experience-projects/internship/baimi/photo-01.png", alt: "白米项目资料" },
    { type: "image", src: "assets/experience-projects/internship/baimi/photo-02.jpg", alt: "白米项目照片" },
    { type: "image", src: "assets/experience-projects/internship/baimi/project.png", alt: "白米项目展示" },
  ] },
  { key: "internship-jiuling", category: "internship", city: "深圳", title: "九瓴", enabled: true, landmark: "平安金融中心", anchor: { x: 0.08, y: 0.69, z: 0.57 }, media: [
    { type: "image", src: "assets/experience-projects/internship/jiuling/photo.jpg", alt: "九瓴项目照片" },
  ] },
  { key: "personal-claude-translator", category: "personal", title: "Claude 桌面翻译", enabled: false, anchor: { x: 0.68, y: 0.73, z: 0.61 }, media: [] },
  { key: "personal-squirrel-docs", category: "personal", title: "Codex 松鼠文仓", enabled: false, anchor: { x: 0.82, y: 0.65, z: 0.67 }, media: [] },
  { key: "personal-fullydancy", category: "personal", title: "Codex FullyDancy", enabled: false, anchor: { x: 0.75, y: 0.54, z: 0.58 }, media: [] },
  { key: "school-uiux", category: "school", title: "UIUX", enabled: true, anchor: { x: 0.43, y: 0.64, z: 0.62 }, media: [
    { type: "image", src: "assets/experience-projects/school/uiux/ux.png", alt: "UIUX 项目资料", wide: true },
  ] },
  { key: "school-apex", category: "school", title: "APEX", enabled: true, anchor: { x: 0.52, y: 0.76, z: 0.68 }, media: [
    { type: "video", src: "assets/experience-projects/school/apex/demo.mp4", alt: "APEX 项目视频", wide: true },
    { type: "image", src: "assets/experience-projects/school/apex/cover.jpg", alt: "APEX 项目图片" },
    { type: "image", src: "assets/experience-projects/school/apex/section.png", alt: "APEX 项目长图", wide: true },
  ] },
  { key: "school-cell-factory", category: "school", title: "细胞工厂", enabled: true, anchor: { x: 0.61, y: 0.67, z: 0.70 }, media: [
    { type: "image", src: "assets/experience-projects/school/cell-factory/photo-01.jpg", alt: "细胞工厂项目图片一" },
    { type: "image", src: "assets/experience-projects/school/cell-factory/photo-02.jpg", alt: "细胞工厂项目图片二" },
    { type: "image", src: "assets/experience-projects/school/cell-factory/photo-03.jpg", alt: "细胞工厂项目图片三" },
    { type: "video", src: "assets/experience-projects/school/cell-factory/innovation.mp4", alt: "细胞工厂创新赛视频", wide: true },
    { type: "video", src: "assets/experience-projects/school/cell-factory/live.mp4", alt: "细胞工厂实拍视频", wide: true },
  ] },
];

const PROJECT_BY_KEY = new Map(EXPERIENCE_PROJECTS.map(project => [project.key, project]));

function loadModel(loader, onProgress) {
  return new Promise((resolve, reject) => {
    loader.load(MODEL_URL, resolve, onProgress, reject);
  });
}

function modelDistance(camera, radius) {
  const vertical = THREE.MathUtils.degToRad(camera.fov);
  const horizontal = 2 * Math.atan(Math.tan(vertical / 2) * camera.aspect);
  const limitingFov = Math.max(Math.min(vertical, horizontal), 0.2);
  return radius / Math.sin(limitingFov / 2) * 1.08;
}

function mediaMarkup(asset) {
  const wide = asset.wide ? ' class="wide"' : "";
  if (asset.type === "video") {
    return `<video${wide} src="${asset.src}" controls playsinline preload="metadata" aria-label="${asset.alt}"></video>`;
  }
  return `<img${wide} src="${asset.src}" alt="${asset.alt}">`;
}

function showSchoolProject(projectKey) {
  const project = SCHOOL_PROJECTS[projectKey];
  const panel = document.querySelector("[data-school-project-panel]");
  if (!project || !panel) return;

  const title = panel.querySelector("[data-school-project-title]");
  const media = panel.querySelector("[data-school-project-media]");
  if (title) title.textContent = project.title;
  if (media) media.innerHTML = project.media.map(mediaMarkup).join("");
  panel.hidden = false;
  document.querySelectorAll("[data-school-project-trigger]").forEach(trigger => {
    const active = trigger.dataset.schoolProjectTrigger === projectKey;
    trigger.classList.toggle("is-active", active);
    trigger.setAttribute("aria-pressed", String(active));
  });
}

export async function mountExperienceIsland(container) {
  if (!(container instanceof HTMLElement) || activeMount) return activeMount;

  activeMount = (async () => {
    const area = container.closest(".island-area");
    const status = area?.querySelector(".island-loading");
    const retry = area?.querySelector(".island-retry");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.01, 10000);
    let renderer;

    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    } catch (error) {
      area?.classList.add("webgl-unavailable");
      if (status) status.textContent = "\u5f53\u524d\u6d4f\u89c8\u5668\u65e0\u6cd5\u663e\u793a 3D \u6a21\u578b";
      throw error;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setClearColor(0x000000, 0);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.9;
    container.append(renderer.domElement);

    scene.add(new THREE.HemisphereLight(0xfff8ed, 0x8c8178, 2.6));
    const keyLight = new THREE.DirectionalLight(0xffffff, 3.4);
    keyLight.position.set(6, 10, 8);
    scene.add(keyLight);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.enablePan = false;
    controls.minPolarAngle = Math.PI * 0.18;
    controls.maxPolarAngle = Math.PI * 0.82;

    let model = null;
    let modelBounds = null;
    let modelSize = new THREE.Vector3(1, 1, 1);
    let radius = 4;
    let frame = 0;
    let running = false;
    let loading = false;
    let pointerDown = null;
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const projectedAnchor = new THREE.Vector3();

    const updateProjectLabels = () => {
      if (!model || !modelBounds) return;
      area?.querySelectorAll("[data-school-project-trigger]").forEach(trigger => {
        const anchor = PROJECT_ANCHORS[trigger.dataset.schoolProjectTrigger];
        if (!anchor) return;
        projectedAnchor.set(
          THREE.MathUtils.lerp(modelBounds.min.x, modelBounds.max.x, anchor.x),
          THREE.MathUtils.lerp(modelBounds.min.y, modelBounds.max.y, anchor.y),
          THREE.MathUtils.lerp(modelBounds.min.z, modelBounds.max.z, anchor.z),
        );
        model.localToWorld(projectedAnchor);
        projectedAnchor.project(camera);
        trigger.style.left = `${(projectedAnchor.x * 0.5 + 0.5) * container.clientWidth}px`;
        trigger.style.top = `${(-projectedAnchor.y * 0.5 + 0.5) * container.clientHeight}px`;
        trigger.style.transform = "translate(-50%, -50%)";
        trigger.hidden = projectedAnchor.z < -1 || projectedAnchor.z > 1;
      });
    };

    area?.querySelectorAll("[data-school-project-trigger]").forEach(trigger => {
      trigger.addEventListener("click", () => showSchoolProject(trigger.dataset.schoolProjectTrigger));
    });

    const fitModel = () => {
      if (!model) return;
      const distance = modelDistance(camera, radius);
      const zoomRange = experienceIslandZoomRange(distance);
      camera.position.copy(new THREE.Vector3(1.45, 0.95, 1.65).normalize().multiplyScalar(zoomRange.initialDistance));
      controls.target.set(0, 0, 0);
      controls.minDistance = zoomRange.minDistance;
      controls.maxDistance = zoomRange.maxDistance;
      controls.update();
    };

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      fitModel();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const render = () => {
      if (!running) return;
      controls.update();
      updateProjectLabels();
      renderer.render(scene, camera);
      frame = requestAnimationFrame(render);
    };
    const start = () => {
      if (running || !model) return;
      running = true;
      render();
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(frame);
    };
    const syncVisibility = () => document.hidden ? stop() : start();
    document.addEventListener("visibilitychange", syncVisibility);
    controls.addEventListener("change", updateProjectLabels);

    const loader = new GLTFLoader();
    const projectFromIntersection = intersection => {
      if (!model || !modelBounds || !intersection?.point) return null;
      const local = model.worldToLocal(intersection.point.clone());
      const nx = THREE.MathUtils.clamp((local.x - modelBounds.min.x) / modelSize.x, 0, 1);
      const ny = THREE.MathUtils.clamp((local.y - modelBounds.min.y) / modelSize.y, 0, 1);

      if (ny < 0.42) return null;
      if (nx < 0.43) return "uiux";
      if (nx < 0.58) return "apex";
      return "cell";
    };

    const pickSchoolProject = event => {
      if (!model) return null;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObject(model, true).find(item => item.object?.isMesh);
      return projectFromIntersection(hit);
    };

    renderer.domElement.addEventListener("pointerdown", event => {
      pointerDown = { x: event.clientX, y: event.clientY };
    });
    renderer.domElement.addEventListener("pointermove", event => {
      renderer.domElement.style.cursor = pickSchoolProject(event) ? "pointer" : "grab";
    });
    renderer.domElement.addEventListener("pointerleave", () => {
      renderer.domElement.style.cursor = "grab";
    });
    renderer.domElement.addEventListener("click", event => {
      if (pointerDown) {
        const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
        pointerDown = null;
        if (moved > 8) return;
      }
      const project = pickSchoolProject(event);
      if (project) showSchoolProject(project);
    });

    const loadScene = async () => {
      if (loading || model) return Boolean(model);
      loading = true;
      area?.classList.remove("model-load-error");
      if (retry) retry.hidden = true;
      if (status) status.textContent = "\u6b63\u5728\u52a0\u8f7d\u7ecf\u5386\u5c9b\u6a21\u578b\u2026";
      try {
        const gltf = await loadModel(loader, event => {
          if (!status || !event.total) return;
          status.textContent = `\u6a21\u578b\u52a0\u8f7d ${Math.round(event.loaded / event.total * 100)}%`;
        });
        model = gltf.scene;
        const bounds = new THREE.Box3().setFromObject(model);
        const sphere = bounds.getBoundingSphere(new THREE.Sphere());
        modelBounds = bounds.clone();
        modelSize = bounds.getSize(new THREE.Vector3());
        model.position.sub(sphere.center);
        radius = Math.max(sphere.radius, 0.1);
        scene.add(model);
        resize();
        if (status) status.textContent = "\u62d6\u52a8\u65cb\u8f6c \u00b7 \u6eda\u8f6e\u7f29\u653e";
        syncVisibility();
        return true;
      } catch {
        area?.classList.add("model-load-error");
        if (status) status.textContent = "\u6a21\u578b\u52a0\u8f7d\u5931\u8d25";
        if (retry) retry.hidden = false;
        return false;
      } finally {
        loading = false;
      }
    };

    retry?.addEventListener("click", loadScene);
    await loadScene();
    return { renderer, controls, resizeObserver, stop };
  })();

  return activeMount;
}

function mountWhenReady() {
  const container = document.querySelector(".island-canvas");
  if (container) mountExperienceIsland(container).catch(() => {});
}

mountWhenReady();
window.addEventListener("portfolio:ready", mountWhenReady, { once: true });
