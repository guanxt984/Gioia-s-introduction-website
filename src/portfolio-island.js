import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { experienceIslandZoomRange, preserveOrbitDistance } from "./experience-island-zoom.js";
import { createIslandStabilizer, layoutProjectLabels, selectFrontIsland } from "./experience-island-visibility.js";
import { ISLAND_CONTENT, PROJECT_CONTENT } from "./experience-island-content.js";
import { openExperienceMediaInNewTab, renderIslandOverview, renderProjectDetail } from "./experience-island-renderers.js";
import {
  beginProgrammaticNavigation,
  cancelProgrammaticNavigation as cancelProgrammaticNavigationState,
  commitManualCategory,
  createExperienceNavigationState,
  finishProgrammaticNavigation,
} from "./experience-island-navigation.js";

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
  { key: "internship-pollo-ai", category: "internship", title: "Pollo AI", enabled: true, meshName: "tripo_part_5", anchor: { x: -0.325, y: 0.71, z: 0.075 }, media: [] },
  { key: "personal-comfyui", category: "personal", title: "ComfyUI", enabled: true, meshName: "tripo_part_0", highlightMode: "local", highlightShape: "building", anchor: { x: 0.235, y: 0.49, z: -0.075 }, media: [] },
  { key: "personal-squirrel-docs", category: "personal", title: "Codex 松鼠文仓", enabled: true, meshName: "tripo_part_9", anchor: { x: 0.195, y: 0.49, z: 0.23 }, media: [] },
  { key: "personal-fullydancy", category: "personal", title: "Codex FullyDancy", enabled: true, meshName: "tripo_part_8", anchor: { x: 0.345, y: 0.52, z: -0.095 }, media: [] },
  { key: "school-memora", category: "school", title: "MEMORA", enabled: true, meshName: "tripo_part_4", highlightMode: "component", componentAnchor: { x: 0.0301, y: 0.4191, z: -0.2511 }, anchor: { x: 0.0301, y: 0.47, z: -0.2511 }, media: [] },
  { key: "school-apex", category: "school", title: "APEX", enabled: true, meshName: "tripo_part_14", anchor: { x: 0.09, y: 0.51, z: -0.37 }, media: [] },
  { key: "school-cell-factory", category: "school", title: "细胞工厂", enabled: true, meshName: "tripo_part_4", highlightMode: "component", componentAnchor: { x: -0.0358, y: 0.4256, z: -0.3058 }, anchor: { x: -0.0358, y: 0.48, z: -0.3058 }, media: [] },
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

function renderIslandDefault(category, onNavigate = null) {
  const overview = document.querySelector("[data-experience-overview]");
  const detail = document.querySelector("[data-school-project-panel]");
  const content = ISLAND_CONTENT[category];
  if (!overview || !content) return;
  overview.hidden = false;
  if (detail) detail.hidden = true;
  renderIslandOverview(overview, content, onNavigate || (projectKey => window.experienceIslandNavigation?.navigateToProject(projectKey)));
  const scrollContainer = overview.closest(".experience-copy");
  if (scrollContainer) {
    scrollContainer.classList.add("is-overview");
    scrollContainer.scrollTop = 0;
  }
}

function showExperienceProject(projectKey) {
  const project = PROJECT_BY_KEY.get(projectKey);
  const overview = document.querySelector("[data-experience-overview]");
  const panel = document.querySelector("[data-school-project-panel]");
  if (!project?.enabled || !panel) return;
  const content = PROJECT_CONTENT.get(projectKey) || { title: project.title, summary: "项目内容整理中。" };
  const island = ISLAND_CONTENT[project.category];
  renderProjectDetail(panel, { ...content, category: project.category, title: content.title || project.title }, island, {
    onOpenMedia: (slot, index) => openExperienceMediaInNewTab(slot, index),
  });
  if (overview) overview.hidden = true;
  panel.hidden = false;
  const scrollContainer = panel.closest(".experience-copy");
  if (scrollContainer) {
    scrollContainer.classList.remove("is-overview");
    scrollContainer.scrollTop = 0;
  }
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
    const NAVIGATION_DURATION_MS = 760;
    let activeCategory = null;
    let selectedProjectKey = null;
    let hoveredProjectKey = null;
    let pointerHoveredProjectKey = null;
    let focusedProjectKey = null;
    let leftHoveredProjectKey = null;
    let leftFocusedProjectKey = null;
    let navigationState = createExperienceNavigationState(null);
    let navigationAnimation = null;
    let queuedNavigation = null;
    let dragging = false;
    let hasFitted = false;
    const stabilizeIsland = createIslandStabilizer();
    const pointer = new THREE.Vector2();
    const raycaster = new THREE.Raycaster();
    const projectedAnchor = new THREE.Vector3();
    const cameraAnchor = new THREE.Vector3();
    const highlightColor = new THREE.Color(0xff6a1a);
    const highlightShells = new Map();
    const projectedVisibleProjectKeys = new Set();
    const interactiveProjectKeys = new Set();
    const displayedLabelKeys = new Set();
    let labelOffsets = new Map();
    const clickableMeshes = [];
    const clickableProjectKeys = new WeakMap();
    const labels = [...area.querySelectorAll("button[data-experience-project]")].map(button => ({
      button, outer: button.parentElement, key: button.dataset.experienceProject,
      project: PROJECT_BY_KEY.get(button.dataset.experienceProject), width: 0, height: 0,
    }));
    const measureLabels = () => {
      labels.forEach(label => {
        const hidden = label.outer.hidden;
        label.outer.hidden = false;
        label.width = label.button.offsetWidth;
        label.height = label.button.offsetHeight;
        label.outer.hidden = hidden;
      });
    };
    let maxLabelScale = 1.1;
    const measureLabelScale = () => {
      const css = getComputedStyle(container);
      maxLabelScale = Math.max(...['dim', 'current', 'hover', 'selected'].map(state =>
        parseFloat(css.getPropertyValue(`--island-label-${state}-scale`)) || 1));
      measureLabels();
    };
    const syncNavigationState = next => {
      navigationState = next;
      activeCategory = next.activeCategory;
      selectedProjectKey = next.selectedProjectKey;
    };
    const updateCategoryUI = () => {
      area?.setAttribute("data-front-island", activeCategory ?? "");
      if (currentIslandLabel && CURRENT_ISLAND_LABELS[activeCategory]) {
        currentIslandLabel.textContent = CURRENT_ISLAND_LABELS[activeCategory];
      }
      area?.querySelectorAll("[data-experience-island]").forEach(button => {
        button.setAttribute("aria-pressed", String(button.dataset.experienceIsland === activeCategory));
      });
    };
    const syncLabelStates = () => labels.forEach(({button, outer, key, project}) => {
      const current = project.category === activeCategory;
      button.classList.toggle('is-current', current);
      button.classList.toggle('is-selected', current && key === selectedProjectKey);
      button.classList.toggle('is-hovered', current && key === hoveredProjectKey);
      button.disabled = !current || !project.enabled;
      button.setAttribute('aria-pressed', String(key === selectedProjectKey));
      outer.style.zIndex = key === selectedProjectKey ? '4' : key === hoveredProjectKey ? '3' : current ? '2' : '1';
    });
    const syncHover = () => {
      hoveredProjectKey = [pointerHoveredProjectKey, focusedProjectKey, leftHoveredProjectKey, leftFocusedProjectKey]
        .find(key => key && PROJECT_BY_KEY.get(key)?.enabled && (interactiveProjectKeys.has(key) || key === leftHoveredProjectKey || key === leftFocusedProjectKey)) || null;
      syncLabelStates();
      updateBuildingHighlights();
    };

    const renderContentForState = () => {
      if (selectedProjectKey) showExperienceProject(selectedProjectKey);
      else if (activeCategory) renderIslandDefault(activeCategory, navigateToProject);
    };
    const commitActiveCategory = (category, projectKey = null, mode = "manual") => {
      const next = mode === "programmatic"
        ? finishProgrammaticNavigation(navigationState, category, projectKey)
        : commitManualCategory(navigationState, category);
      syncNavigationState(next);
      stabilizeIsland.reset(category);
      updateCategoryUI();
      syncLabelStates();
      updateBuildingHighlights();
      renderContentForState();
    };
    const getCameraDestination = category => {
      if (!model) return null;
      const island = SUB_ISLANDS.find(item => item.category === category);
      if (!island) return null;
      const anchor = new THREE.Vector3(island.anchor.x, island.anchor.y, island.anchor.z);
      model.localToWorld(anchor);
      const target = controls.target.clone();
      const offset = camera.position.clone().sub(target);
      const distance = Math.max(offset.length(), 0.001);
      const polar = Math.acos(THREE.MathUtils.clamp(offset.y / distance, -1, 1));
      const horizontal = new THREE.Vector3(anchor.x - target.x, 0, anchor.z - target.z);
      if (horizontal.lengthSq() < 0.000001) horizontal.set(offset.x, 0, offset.z);
      horizontal.normalize();
      const sinPolar = Math.sin(polar);
      return {
        position: target.clone().add(new THREE.Vector3(
          horizontal.x * sinPolar * distance,
          Math.cos(polar) * distance,
          horizontal.z * sinPolar * distance,
        )),
        target,
      };
    };
    const startProgrammaticNavigation = (category, projectKey = null) => {
      if (!model) {
        queuedNavigation = { category, projectKey };
        return;
      }
      if (category === activeCategory && !navigationAnimation) {
        syncNavigationState({ ...navigationState, selectedProjectKey: projectKey, navigationMode: "manual" });
        updateCategoryUI();
        syncLabelStates();
        updateBuildingHighlights();
        renderContentForState();
        return;
      }
      const destination = getCameraDestination(category);
      if (!destination) return;
      navigationAnimation = {
        startPosition: camera.position.clone(),
        endPosition: destination.position,
        startTarget: controls.target.clone(),
        endTarget: destination.target,
        category,
        projectKey,
        startedAt: performance.now(),
        duration: NAVIGATION_DURATION_MS,
      };
      syncNavigationState(beginProgrammaticNavigation(navigationState, category, projectKey));
      syncLabelStates();
    };
    const navigateToIsland = category => {
      if (!ISLAND_CONTENT[category]) return;
      startProgrammaticNavigation(category, null);
    };
    const navigateToProject = projectKey => {
      const project = PROJECT_BY_KEY.get(projectKey);
      if (!project?.enabled) return;
      if (project.category === activeCategory && !navigationAnimation) {
        syncNavigationState({ ...navigationState, selectedProjectKey: projectKey, navigationMode: "manual" });
        hoveredProjectKey = projectKey;
        updateCategoryUI();
        syncLabelStates();
        updateBuildingHighlights();
        renderContentForState();
        return;
      }
      startProgrammaticNavigation(project.category, projectKey);
    };
    const updateProgrammaticNavigation = time => {
      if (!navigationAnimation) return;
      const animation = navigationAnimation;
      const progress = Math.min(1, Math.max(0, (time - animation.startedAt) / animation.duration));
      const eased = 1 - Math.pow(1 - progress, 3);
      camera.position.lerpVectors(animation.startPosition, animation.endPosition, eased);
      controls.target.lerpVectors(animation.startTarget, animation.endTarget, eased);
      if (progress >= 1) {
        navigationAnimation = null;
        commitActiveCategory(animation.category, animation.projectKey, "programmatic");
      }
    };

    const updateProjectLabels = () => {
      if (!model) return;
      const islandDepths = SUB_ISLANDS.map(island => {
        cameraAnchor.set(island.anchor.x, island.anchor.y, island.anchor.z);
        model.localToWorld(cameraAnchor);
        camera.worldToLocal(cameraAnchor);
        return { category: island.category, depth: cameraAnchor.z };
      });
      if (navigationState.navigationMode === "manual") {
        const stableCategory = stabilizeIsland(selectFrontIsland(islandDepths), performance.now());
        if (stableCategory && stableCategory !== activeCategory) commitActiveCategory(stableCategory);
      }

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
          inView: cameraAnchor.z < 0 && projectedAnchor.z >= -1 && projectedAnchor.z <= 1
            && Math.abs(projectedAnchor.x) <= 1.04 && Math.abs(projectedAnchor.y) <= 1.04,
          x: (projectedAnchor.x * 0.5 + 0.5) * container.clientWidth,
          y: (-projectedAnchor.y * 0.5 + 0.5) * container.clientHeight,
        };
      });
      projectedVisibleProjectKeys.clear();
      interactiveProjectKeys.clear();
      projectPositions.forEach(position => {
        if (!position.inView) return;
        projectedVisibleProjectKeys.add(position.key);
        if (position.category === activeCategory && PROJECT_BY_KEY.get(position.key).enabled) {
          interactiveProjectKeys.add(position.key);
        }
      });
      if (!interactiveProjectKeys.has(pointerHoveredProjectKey)) pointerHoveredProjectKey = null;
      if (!interactiveProjectKeys.has(focusedProjectKey)) focusedProjectKey = null;
      syncHover();
      const positionsByKey = new Map(projectPositions.map(position => [position.key, position]));
      const candidates = labels.filter(label => projectedVisibleProjectKeys.has(label.key)).map(label => {
        const p = positionsByKey.get(label.key);
        return {...p, x: p.x + 8, y: p.y - 8 - label.height * maxLabelScale,
          width: label.width * maxLabelScale, height: label.height * maxLabelScale};
      });
      const placed = layoutProjectLabels(candidates, activeCategory, selectedProjectKey, hoveredProjectKey, labelOffsets);
      labelOffsets = new Map(placed.map(p => [p.key, { top: p.y, offsetY: p.offsetY }]));
      const placements = new Map(placed.map(p => [p.key, p]));
      displayedLabelKeys.clear();
      placed.forEach(p => displayedLabelKeys.add(p.key));
      labels.forEach(({outer, key}) => {
        const position = positionsByKey.get(key);
        const placement = placements.get(key);
        outer.hidden = !displayedLabelKeys.has(key);
        if (!placement) return;
        outer.style.left = `${position.x + 8}px`;
        outer.style.top = `${position.y - 8 + placement.offsetY}px`;
      });
    };

    const updateBuildingHighlights = () => {
      EXPERIENCE_PROJECTS.forEach(project => {
        const selected = project.key === selectedProjectKey;
        const hovered = project.key === hoveredProjectKey;
        const active = project.enabled && (selected || hovered);
        (highlightShells.get(project.key) || []).forEach(record => {
          record.shell.visible = active;
          record.material.transparent = true;
          record.material.opacity = selected ? 0.95 : 0.45;
          record.shell.scale.setScalar(record.baseScale);
        });
      });
    };

    labels.forEach(({button, key}) => {
      button.addEventListener('click', () => navigateToProject(key));
      button.addEventListener('pointerenter', () => { pointerHoveredProjectKey = key; syncHover(); });
      button.addEventListener('pointerleave', () => { pointerHoveredProjectKey = null; syncHover(); });
      button.addEventListener('focus', () => { focusedProjectKey = key; syncHover(); });
      button.addEventListener('blur', () => { focusedProjectKey = null; syncHover(); });
    });

    const overview = document.querySelector("[data-experience-overview]");
    overview?.addEventListener("click", event => {
      const projectButton = event.target.closest("[data-navigate-project]");
      if (projectButton) navigateToProject(projectButton.dataset.navigateProject);
    });
    overview?.addEventListener("pointerover", event => {
      const projectButton = event.target.closest("[data-navigate-project]");
      if (!projectButton) return;
      leftHoveredProjectKey = projectButton.dataset.navigateProject;
      syncHover();
    });
    overview?.addEventListener("pointerout", event => {
      const projectButton = event.target.closest("[data-navigate-project]");
      if (!projectButton || projectButton.contains(event.relatedTarget)) return;
      leftHoveredProjectKey = null;
      syncHover();
    });
    overview?.addEventListener("focusin", event => {
      const projectButton = event.target.closest("[data-navigate-project]");
      if (!projectButton) return;
      leftFocusedProjectKey = projectButton.dataset.navigateProject;
      syncHover();
    });
    overview?.addEventListener("focusout", event => {
      const projectButton = event.target.closest("[data-navigate-project]");
      if (!projectButton || projectButton.contains(event.relatedTarget)) return;
      leftFocusedProjectKey = null;
      syncHover();
    });
    window.experienceIslandNavigation = {
      navigateToIsland,
      navigateToProject,
      getState: () => ({ activeCategory, selectedProjectKey, hoveredProjectKey, navigationMode: navigationState.navigationMode }),
    };

    const fitModel = () => {
      if (!model) return;
      const distance = modelDistance(camera, radius);
      const zoomRange = experienceIslandZoomRange(distance);
      camera.position.copy(new THREE.Vector3(1.45, 0.95, 1.65).normalize().multiplyScalar(zoomRange.initialDistance));
      controls.target.set(0, 0, 0);
      controls.minDistance = zoomRange.minDistance;
      controls.maxDistance = zoomRange.maxDistance;
      controls.update();
      if (!hasFitted) {
        const initialView = getCameraDestination("school");
        if (initialView) {
          camera.position.copy(initialView.position);
          controls.target.copy(initialView.target);
          controls.update();
        }
      }
      hasFitted = true;
    };

    const resize = () => {
      const width = Math.max(container.clientWidth, 1);
      const height = Math.max(container.clientHeight, 1);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      renderer.setSize(width, height, false);
      if (model) {
        if (!hasFitted) fitModel();
        else {
          const range = experienceIslandZoomRange(modelDistance(camera, radius));
          controls.minDistance = range.minDistance;
          controls.maxDistance = range.maxDistance;
          preserveOrbitDistance(camera, controls.target, range);
          camera.updateMatrixWorld();
        }
      }
      measureLabelScale();
      updateProjectLabels();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    document.fonts.ready.then(() => { measureLabelScale(); updateProjectLabels(); });

    const render = time => {
      if (!running) return;
      controls.update();
      updateProgrammaticNavigation(time || performance.now());
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
      return project?.enabled && interactiveProjectKeys.has(key) ? key : null;
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
    controls.addEventListener('start', () => {
      if (navigationAnimation) {
        navigationAnimation = null;
        syncNavigationState(cancelProgrammaticNavigationState(navigationState));
      }
      dragging = true;
      pointerHoveredProjectKey = null;
      syncHover();
    });
    controls.addEventListener('end', () => { dragging = false; });
    let lastHoverPick = 0;
    renderer.domElement.addEventListener("pointermove", event => {
      if (event.timeStamp - lastHoverPick < 50) return;
      lastHoverPick = event.timeStamp;
      pointerHoveredProjectKey = dragging ? null : pickExperienceProject(event);
      syncHover();
      renderer.domElement.style.cursor = pointerHoveredProjectKey ? "pointer" : "grab";
    });
    renderer.domElement.addEventListener("pointerleave", () => {
      renderer.domElement.style.cursor = "grab";
      pointerHoveredProjectKey = null;
      syncHover();
    });
    renderer.domElement.addEventListener("click", event => {
      if (pointerDown) {
        const moved = Math.hypot(event.clientX - pointerDown.x, event.clientY - pointerDown.y);
        pointerDown = null;
        if (moved > 8) return;
      }
      const project = pickExperienceProject(event);
      if (project) navigateToProject(project);
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
        if (queuedNavigation) {
          const pending = queuedNavigation;
          queuedNavigation = null;
          startProgrammaticNavigation(pending.category, pending.projectKey);
        }
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
