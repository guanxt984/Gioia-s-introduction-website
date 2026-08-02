import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";

const MODEL_URL = "./models/experience-island-uploaded-preview.glb";
let activeMount = null;

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

export async function mountExperienceIsland(container) {
  if (!(container instanceof HTMLElement) || activeMount) return activeMount;

  activeMount = (async () => {
    const area = container.closest(".island-area");
    const status = area?.querySelector(".island-loading");
    const retry = area?.querySelector(".island-retry");
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(32, 1, 0.1, 1000);
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
    let radius = 4;
    let frame = 0;
    let running = false;
    let loading = false;

    const fitModel = () => {
      if (!model) return;
      const distance = modelDistance(camera, radius);
      camera.position.copy(new THREE.Vector3(1.45, 0.95, 1.65).normalize().multiplyScalar(distance));
      controls.target.set(0, 0, 0);
      controls.minDistance = distance * 0.58;
      controls.maxDistance = distance * 1.75;
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

    const loader = new GLTFLoader();
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
