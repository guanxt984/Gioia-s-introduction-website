import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { experienceIslandZoomRange } from "./experience-island-zoom.js";

const MODEL_URL = "./models/experience-island-uploaded-preview.glb";
let activeMount = null;

const SCHOOL_PROJECTS = {
  uiux: {
    title: "UIUX",
    media: [
      { type: "image", src: "assets/school-projects/uiux.png", alt: "UIUX 项目资料", wide: true },
    ],
  },
  apex: {
    title: "APEX",
    media: [
      { type: "video", src: "assets/school-projects/apex-demo.mp4", alt: "APEX 项目视频", wide: true },
      { type: "image", src: "assets/school-projects/apex-cover.jpg", alt: "APEX 项目图片" },
      { type: "image", src: "assets/school-projects/apex-section.png", alt: "APEX 项目长图", wide: true },
    ],
  },
  cell: {
    title: "细胞工厂",
    media: [
      { type: "image", src: "assets/school-projects/cell-factory-01.jpg", alt: "细胞工厂项目图片一" },
      { type: "image", src: "assets/school-projects/cell-factory-02.jpg", alt: "细胞工厂项目图片二" },
      { type: "image", src: "assets/school-projects/cell-factory-03.jpg", alt: "细胞工厂项目图片三" },
      { type: "video", src: "assets/school-projects/cell-factory-innovation.mp4", alt: "细胞工厂创新赛视频", wide: true },
      { type: "video", src: "assets/school-projects/cell-factory-live.mp4", alt: "细胞工厂实拍视频", wide: true },
    ],
  },
};

const PROJECT_ANCHORS = {
  uiux: { x: 0.24, y: 0.64, z: 0.62 },
  apex: { x: 0.5, y: 0.76, z: 0.68 },
  cell: { x: 0.72, y: 0.67, z: 0.7 },
};

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
