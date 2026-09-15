import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { experienceIslandZoomRange } from "./experience-island-zoom.js";
import { labelLimitForCategory, selectFrontIsland, selectVisibleProjects } from "./experience-island-visibility.js";
import { solveJustifiedMosaic } from "../public/justified-media-layout.js";

const MODEL_URL = "./models/experience-island-uploaded-preview.glb";
const SUB_ISLANDS = [
  { category: "internship", anchor: { x: -0.185, y: 0.12, z: 0.08 } },
  { category: "personal", anchor: { x: 0.25, y: 0.12, z: 0.065 } },
  { category: "school", anchor: { x: -0.005, y: 0.12, z: -0.28 } },
];
let activeMount = null;

const EXPERIENCE_PROJECTS = [
  { key: "internship-lixiang", category: "internship", city: "北京", title: "理想", enabled: true, landmark: "故宫", meshName: "tripo_part_3", anchor: { x: -0.21, y: 0.51, z: -0.105 }, media: [
    { type: "image", src: "assets/experience-island-details/internship/lixiang/certificate.webp", alt: "理想汽车离职证明", width: 1240, height: 1753 },
  ] },
  { key: "internship-qianchuan", category: "internship", city: "上海", title: "仟传", enabled: true, landmark: "东方明珠", meshName: "tripo_part_6", anchor: { x: -0.04, y: 0.69, z: 0.10 }, media: [
    { type: "image", src: "assets/experience-island-details/internship/qianchuan/certificate.webp", alt: "仟传实习证明", width: 1698, height: 2400 },
  ] },
  { key: "internship-baimi", category: "internship", city: "杭州", title: "白米", enabled: true, landmark: "西湖", meshName: "tripo_part_7", anchor: { x: -0.15, y: 0.40, z: 0.19 }, media: [
    { type: "image", src: "assets/experience-island-details/internship/baimi/proof.webp", alt: "白米项目证明", width: 2085, height: 2780 },
  ] },
  { key: "internship-jiuling", category: "internship", city: "深圳", title: "九瓴", enabled: true, landmark: "平安金融中心", meshName: "tripo_part_5", anchor: { x: -0.325, y: 0.71, z: 0.075 }, media: [
    { type: "image", src: "assets/experience-island-details/internship/jiuling/agreement.webp", alt: "九瓴实习协议解除资料", width: 1698, height: 2400 },
  ] },
  { key: "personal-claude-translator", category: "personal", title: "Claude 桌面翻译", enabled: true, meshName: "tripo_part_0", highlightMode: "local", highlightShape: "building", anchor: { x: 0.235, y: 0.49, z: -0.075 }, media: [] },
  { key: "personal-squirrel-docs", category: "personal", title: "Codex 松鼠文仓", enabled: true, meshName: "tripo_part_9", anchor: { x: 0.195, y: 0.49, z: 0.23 }, media: [] },
  { key: "personal-fullydancy", category: "personal", title: "Codex FullyDancy", enabled: true, meshName: "tripo_part_8", anchor: { x: 0.345, y: 0.52, z: -0.095 }, media: [] },
  { key: "school-uiux", category: "school", title: "UIUX", enabled: true, meshName: "tripo_part_4", highlightMode: "component", componentAnchor: { x: 0.0301, y: 0.4191, z: -0.2511 }, anchor: { x: 0.0301, y: 0.47, z: -0.2511 }, media: [
    { type: "image", src: "assets/experience-island-details/school/uiux/ux.webp", alt: "UIUX 项目资料", width: 2400, height: 1354 },
  ] },
  { key: "school-apex", category: "school", title: "APEX", enabled: true, meshName: "tripo_part_14", anchor: { x: 0.09, y: 0.51, z: -0.37 }, media: [
    { type: "video", src: "assets/experience-island-details/school/apex/demo.mp4", alt: "APEX 项目视频" },
    { type: "image", src: "assets/experience-island-details/school/apex/section.webp", alt: "APEX 项目长图", width: 2400, height: 5214 },
  ] },
  { key: "school-cell-factory", category: "school", title: "细胞工厂", enabled: true, meshName: "tripo_part_4", highlightMode: "component", componentAnchor: { x: -0.0358, y: 0.4256, z: -0.3058 }, anchor: { x: -0.0358, y: 0.48, z: -0.3058 }, media: [
    { type: "video", src: "assets/experience-projects/school/cell-factory/innovation.mp4", alt: "细胞工厂项目视频" },
  ] },
];

const PROJECT_BY_KEY = new Map(EXPERIENCE_PROJECTS.map(project => [project.key, project]));
const CURRENT_ISLAND_LABELS = {
  internship: "实习经历岛",
  school: "学校项目岛",
  personal: "个人 AI 实践岛",
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

function extractConnectedComponentGeometry(mesh, modelAnchor) {
  const source = mesh.geometry;
  const position = source.getAttribute("position");
  const index = source.index;
  if (!position || !index) return null;

  mesh.updateWorldMatrix(true, false);
  const target = mesh.worldToLocal(modelAnchor.clone());
  let nearest = 0;
  let nearestDistance = Infinity;
  const vertex = new THREE.Vector3();
  for (let i = 0; i < position.count; i += 1) {
    vertex.fromBufferAttribute(position, i);
    const distance = vertex.distanceToSquared(target);
    if (distance < nearestDistance) {
      nearest = i;
      nearestDistance = distance;
    }
  }

  const parents = new Int32Array(position.count);
  for (let i = 0; i < parents.length; i += 1) parents[i] = i;
  const find = value => {
    let root = value;
    while (parents[root] !== root) root = parents[root];
    while (parents[value] !== value) {
      const next = parents[value];
      parents[value] = root;
      value = next;
    }
    return root;
  };
  const join = (left, right) => {
    const a = find(left);
    const b = find(right);
    if (a !== b) parents[b] = a;
  };
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);
    join(a, b);
    join(b, c);
  }

  const selectedRoot = find(nearest);
  const points = [];
  for (let i = 0; i < index.count; i += 3) {
    const a = index.getX(i);
    const b = index.getX(i + 1);
    const c = index.getX(i + 2);
    if (find(a) !== selectedRoot) continue;
    [a, b, c].forEach(vertexIndex => {
      points.push(position.getX(vertexIndex), position.getY(vertexIndex), position.getZ(vertexIndex));
    });
  }
  if (!points.length) return null;
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(points, 3));
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  const center = geometry.boundingBox.getCenter(new THREE.Vector3());
  const size = geometry.boundingBox.getSize(new THREE.Vector3());
  geometry.translate(-center.x, -center.y, -center.z);
  return { geometry, center, size };
}

function resolveProjectAspect(asset) {
  if (asset.width && asset.height) return Promise.resolve({ ...asset, aspect: asset.width / asset.height });
  if (asset.type !== "video") return Promise.resolve({ ...asset, aspect: 0.707 });
  return new Promise(resolve => {
    const probe = document.createElement("video");
    const finish = () => resolve({ ...asset, aspect: probe.videoWidth && probe.videoHeight ? probe.videoWidth / probe.videoHeight : 16 / 9 });
    probe.preload = "metadata";
    probe.addEventListener("loadedmetadata", finish, { once: true });
    probe.addEventListener("error", finish, { once: true });
    probe.src = asset.src;
  });
}

function createProjectMedia(asset) {
  const figure = document.createElement("figure");
  figure.style.flexGrow = asset.aspect;
  if (asset.type === "image") {
    const link = document.createElement("a");
    link.href = asset.src;
    link.target = "_blank";
    link.rel = "noopener";
    link.setAttribute("aria-label", `${asset.alt}，打开原图`);
    const image = document.createElement("img");
    image.src = asset.src;
    image.alt = asset.alt;
    image.width = asset.width;
    image.height = asset.height;
    link.append(image);
    figure.append(link);
  } else if (asset.type === "video") {
    const video = document.createElement("video");
    video.src = asset.src;
    video.controls = true;
    video.playsInline = true;
    video.preload = "metadata";
    video.setAttribute("aria-label", asset.alt);
    figure.append(video);
  } else {
    const link = document.createElement("a");
    link.href = asset.src;
    link.target = "_blank";
    link.rel = "noopener";
    link.textContent = "打开 PDF ↗";
    const frame = document.createElement("iframe");
    frame.src = asset.src;
    frame.title = asset.alt;
    figure.append(link, frame);
  }
  return figure;
}

async function showExperienceProject(projectKey) {
  const project = PROJECT_BY_KEY.get(projectKey);
  const panel = document.querySelector("[data-school-project-panel]");
  if (!project?.enabled || !panel) return;

  const title = panel.querySelector("[data-school-project-title]");
  const kicker = panel.querySelector(".school-project-kicker");
  const media = panel.querySelector("[data-school-project-media]");
  if (title) title.textContent = project.city ? `${project.city} · ${project.title}` : project.title;
  if (kicker) kicker.textContent = project.category === "internship" ? "INTERNSHIP" : project.category === "school" ? "SCHOOL PROJECT" : "PERSONAL PROJECT";
  media?.querySelectorAll("video").forEach(video => video.pause());
  media?.replaceChildren();
  panel.hidden = false;
  if (project.media.length) {
    const assets = await Promise.all(project.media.map(resolveProjectAspect));
    await new Promise(resolve => requestAnimationFrame(resolve));
    const gap = window.innerWidth <= 600 ? 3 : 4;
    const stage = panel.closest("#experience");
    const mediaRect = media.getBoundingClientRect();
    const stageRect = stage?.getBoundingClientRect();
    const maxWidth = Math.max(220, Math.min(media.clientWidth || panel.clientWidth, window.innerWidth - 32));
    const maxHeight = Math.max(180, Math.min(window.innerHeight * 0.80, (stageRect?.bottom || window.innerHeight) - mediaRect.top - 18));
    const layout = solveJustifiedMosaic(assets, maxWidth, maxHeight, gap);
    layout.rows.forEach((rowAssets, rowIndex) => {
      const row = document.createElement("div");
      row.className = "school-project-media-row";
      row.style.width = `${layout.width}px`;
      row.style.height = `${layout.heights[rowIndex]}px`;
      rowAssets.forEach(asset => row.append(createProjectMedia(asset)));
      media.append(row);
    });
  } else {
    if (media) media.innerHTML = '<p class="project-coming-soon">项目资料整理中，敬请期待。</p>';
  }
  document.querySelectorAll("[data-experience-project]").forEach(trigger => {
    const active = trigger.dataset.experienceProject === projectKey;
    trigger.classList.toggle("is-active", active);
    if (trigger instanceof HTMLButtonElement) trigger.setAttribute("aria-pressed", String(active));
  });
}

export async function mountExperienceIsland(container) {
  if (!(container instanceof HTMLElement) || activeMount) return activeMount;

  activeMount = (async () => {
    const area = container.closest(".island-area");
    const status = area?.querySelector(".island-loading");
    const retry = area?.querySelector(".island-retry");
    const currentIslandLabel = document.querySelector("[data-current-island]");
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
    let radius = 4;
    let frame = 0;
    let running = false;
    let loading = false;
    let pointerDown = null;
    let activeCategory = null;
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const projectedAnchor = new THREE.Vector3();
    const cameraAnchor = new THREE.Vector3();
    const highlightColor = new THREE.Color(0xff6a1a);
    const highlightShells = new Map();
    const visibleProjectKeys = new Set();
    const clickableMeshes = [];
    const clickableProjectKeys = new WeakMap();
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateProjectLabels = () => {
      if (!model) return;
      const islandDepths = SUB_ISLANDS.map(island => {
        cameraAnchor.set(island.anchor.x, island.anchor.y, island.anchor.z);
        model.localToWorld(cameraAnchor);
        camera.worldToLocal(cameraAnchor);
        return { category: island.category, depth: cameraAnchor.z };
      });
      activeCategory = selectFrontIsland(islandDepths);
      area?.setAttribute("data-front-island", activeCategory ?? "");
      if (currentIslandLabel && CURRENT_ISLAND_LABELS[activeCategory]) {
        currentIslandLabel.textContent = CURRENT_ISLAND_LABELS[activeCategory];
      }
      area?.querySelectorAll("[data-experience-island]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.experienceIsland === activeCategory));
      });

      const projectPositions = EXPERIENCE_PROJECTS.map(project => {
        projectedAnchor.set(project.anchor.x, project.anchor.y, project.anchor.z);
        model.localToWorld(projectedAnchor);
        cameraAnchor.copy(projectedAnchor);
        camera.worldToLocal(cameraAnchor);
        projectedAnchor.project(camera);
        return {
          key: project.key,
          category: project.category,
          depth: cameraAnchor.z,
          inView: projectedAnchor.z >= -1 && projectedAnchor.z <= 1
            && Math.abs(projectedAnchor.x) <= 1.04 && Math.abs(projectedAnchor.y) <= 1.04,
          x: (projectedAnchor.x * 0.5 + 0.5) * container.clientWidth,
          y: (-projectedAnchor.y * 0.5 + 0.5) * container.clientHeight,
        };
      });
      const visibleKeys = new Set(selectVisibleProjects(
        projectPositions,
        activeCategory,
        labelLimitForCategory(activeCategory),
      ));
      visibleProjectKeys.clear();
      visibleKeys.forEach(key => visibleProjectKeys.add(key));
      const positionsByKey = new Map(projectPositions.map(position => [position.key, position]));

      area?.querySelectorAll("[data-experience-project]").forEach(trigger => {
        const key = trigger.dataset.experienceProject;
        const position = positionsByKey.get(key);
        if (!position) { trigger.hidden = true; return; }
        trigger.style.left = `${position.x}px`;
        trigger.style.top = `${position.y}px`;
        trigger.hidden = !visibleKeys.has(key);
      });
    };

    const updateBuildingHighlights = time => {
      EXPERIENCE_PROJECTS.forEach((project, index) => {
        const active = project.enabled && visibleProjectKeys.has(project.key);
        const pulse = reducedMotion.matches
          ? 1
          : 1 + Math.sin(time * 0.002 + index * 0.72) * 0.012;
        (highlightShells.get(project.key) || []).forEach(record => {
          record.shell.visible = active;
          record.material.opacity = 1;
          record.shell.scale.setScalar(record.baseScale * pulse);
        });
      });
    };

    area?.querySelectorAll("button[data-experience-project]").forEach(trigger => {
      trigger.addEventListener("click", () => showExperienceProject(trigger.dataset.experienceProject));
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

    const render = time => {
      if (!running) return;
      controls.update();
      updateProjectLabels();
      updateBuildingHighlights(time || 0);
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
      const key = intersection?.object ? clickableProjectKeys.get(intersection.object) : null;
      const project = key ? PROJECT_BY_KEY.get(key) : null;
      return project?.enabled && visibleProjectKeys.has(key) ? key : null;
    };

    const pickExperienceProject = event => {
      if (!model) return null;
      const rect = renderer.domElement.getBoundingClientRect();
      pointer.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
      pointer.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(clickableMeshes, false)[0];
      return projectFromIntersection(hit);
    };

    renderer.domElement.addEventListener("pointerdown", event => {
      pointerDown = { x: event.clientX, y: event.clientY };
    });
    let lastHoverPick = 0;
    renderer.domElement.addEventListener("pointermove", event => {
      if (event.timeStamp - lastHoverPick < 50) return;
      lastHoverPick = event.timeStamp;
      renderer.domElement.style.cursor = pickExperienceProject(event) ? "pointer" : "grab";
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
      const project = pickExperienceProject(event);
      if (project) showExperienceProject(project);
    });

    const loadScene = async () => {
      if (loading || model) return Boolean(model);
      loading = true;
      area?.classList.remove("model-load-error");
      if (retry) retry.hidden = true;
      if (status) {
        status.hidden = false;
        status.textContent = "\u6b63\u5728\u52a0\u8f7d\u7ecf\u5386\u5c9b\u6a21\u578b\u2026";
      }
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
        EXPERIENCE_PROJECTS.forEach(project => {
          const node = model.getObjectByName(project.meshName);
          if (!node) return;
          if (project.highlightMode === "component") {
            const componentAnchor = project.componentAnchor || project.anchor;
            const modelAnchor = new THREE.Vector3(componentAnchor.x, componentAnchor.y, componentAnchor.z);
            model.localToWorld(modelAnchor);
            const component = extractConnectedComponentGeometry(node, modelAnchor);
            if (!component) return;
            const edgeGeometry = new THREE.EdgesGeometry(component.geometry, 28);
            const material = new THREE.LineBasicMaterial({
              color: highlightColor,
              transparent: false,
              opacity: 1,
              depthWrite: false,
              toneMapped: false,
            });
            const shell = new THREE.LineSegments(edgeGeometry, material);
            shell.position.copy(component.center);
            shell.scale.setScalar(1.015);
            shell.renderOrder = 4;
            shell.visible = false;
            shell.raycast = () => {};
            node.add(shell);
            highlightShells.set(project.key, [{ shell, material, baseScale: 1.015 }]);

            const hitbox = new THREE.Mesh(
              new THREE.BoxGeometry(
                Math.max(component.size.x, 0.07),
                Math.max(component.size.y, 0.06),
                Math.max(component.size.z, 0.07),
              ),
              new THREE.MeshBasicMaterial({ visible: false }),
            );
            hitbox.position.set(componentAnchor.x, componentAnchor.y, componentAnchor.z);
            model.add(hitbox);
            clickableMeshes.push(hitbox);
            clickableProjectKeys.set(hitbox, project.key);
            return;
          }
          if (project.highlightMode === "local") {
            const material = new THREE.MeshBasicMaterial({
              color: highlightColor,
              transparent: false,
              opacity: 1,
              side: THREE.BackSide,
              depthWrite: false,
              toneMapped: false,
            });
            const localOutline = new THREE.Group();
            if (project.highlightShape === "arch") {
              const pillarGeometry = new THREE.BoxGeometry(0.024, 0.105, 0.035);
              [-0.052, 0.052].forEach(x => {
                const pillar = new THREE.Mesh(pillarGeometry, material);
                pillar.position.set(x, -0.02, 0);
                localOutline.add(pillar);
              });
              const cap = new THREE.Mesh(new THREE.TorusGeometry(0.052, 0.012, 8, 24, Math.PI), material);
              cap.position.y = 0.032;
              localOutline.add(cap);
            } else {
              const body = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.11, 0.06), material);
              const crown = new THREE.Mesh(new THREE.BoxGeometry(0.045, 0.035, 0.045), material);
              crown.position.y = 0.07;
              localOutline.add(body, crown);
            }
            const highlightAnchor = project.highlightAnchor || project.anchor;
            localOutline.position.set(highlightAnchor.x, highlightAnchor.y, highlightAnchor.z);
            localOutline.scale.setScalar(1.018);
            localOutline.visible = false;
            localOutline.traverse(child => { child.raycast = () => {}; });
            model.add(localOutline);
            highlightShells.set(project.key, [{ shell: localOutline, material, baseScale: 1.018 }]);

            const hitbox = new THREE.Mesh(
              new THREE.BoxGeometry(0.12, 0.12, 0.08),
              new THREE.MeshBasicMaterial({ visible: false }),
            );
            hitbox.position.set(highlightAnchor.x, highlightAnchor.y, highlightAnchor.z);
            model.add(hitbox);
            clickableMeshes.push(hitbox);
            clickableProjectKeys.set(hitbox, project.key);
            return;
          }
          const projectMeshes = [];
          node.traverse(child => {
            if (!child.isMesh) return;
            projectMeshes.push(child);
          });
          const records = [];
          projectMeshes.forEach(child => {
            if (project.enabled) {
              clickableMeshes.push(child);
              clickableProjectKeys.set(child, project.key);
            }
            [
              { scale: 1.018 },
            ].forEach(config => {
              const material = new THREE.MeshBasicMaterial({
                color: highlightColor,
                transparent: false,
                opacity: 1,
                side: THREE.BackSide,
                depthWrite: false,
                toneMapped: false,
              });
              const shellMaterials = Array.isArray(child.material)
                ? child.material.map(() => material)
                : material;
              const shell = new THREE.Mesh(child.geometry, shellMaterials);
              shell.name = `${child.name || project.meshName}_project_glow`;
              shell.scale.setScalar(config.scale);
              shell.renderOrder = 3;
              shell.visible = false;
              shell.raycast = () => {};
              child.add(shell);
              records.push({ shell, material, baseScale: config.scale });
            });
          });
          highlightShells.set(project.key, records);
        });
        scene.add(model);
        resize();
        if (status) status.hidden = true;
        syncVisibility();
        return true;
      } catch {
        area?.classList.add("model-load-error");
        if (status) {
          status.hidden = false;
          status.textContent = "\u6a21\u578b\u52a0\u8f7d\u5931\u8d25";
        }
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
