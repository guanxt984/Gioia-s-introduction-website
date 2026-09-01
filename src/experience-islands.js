import * as THREE from "three";

const C = {
  rock: 0x443f3c,
  rockLight: 0x625b55,
  green: 0x78a83b,
  greenLight: 0x9cc94b,
  water: 0x3aa9a5,
  orange: 0xe97820,
  roof: 0xf0a12b,
  stone: 0xd8cfbd,
  tower: 0x91a5aa,
  pearl: 0xd96962,
  purple: 0x8f72cf,
  purpleDark: 0x4b407b,
  indigo: 0x33466f,
  cyan: 0x32d8ee,
  cream: 0xe3c999,
  wood: 0xa96836,
  brick: 0xbf754c,
  skin: 0xd99a6c,
  dark: 0x2f3236,
  white: 0xe9e8e2,
};

const mats = new Map();
function mat(color, emissive = 0x000000, intensity = 0) {
  const key = `${color}-${emissive}-${intensity}`;
  if (!mats.has(key)) {
    mats.set(key, new THREE.MeshStandardMaterial({
      color,
      roughness: 0.88,
      metalness: 0.03,
      flatShading: true,
      emissive,
      emissiveIntensity: intensity,
    }));
  }
  return mats.get(key);
}

function mesh(geometry, material, name, pos = [0, 0, 0], rot = [0, 0, 0], scale = [1, 1, 1]) {
  const value = new THREE.Mesh(geometry, material);
  value.name = name;
  value.position.set(...pos);
  value.rotation.set(...rot);
  value.scale.set(...scale);
  value.castShadow = true;
  value.receiveShadow = true;
  return value;
}

const box = (size, material, name, pos, rot, scale) =>
  mesh(new THREE.BoxGeometry(...size), material, name, pos, rot, scale);

function cylinder(rt, rb, h, segments, material, name, pos, rot = [0, 0, 0]) {
  return mesh(new THREE.CylinderGeometry(rt, rb, h, segments, 1, false), material, name, pos, rot);
}

function sphere(radius, segments, material, name, pos, scale = [1, 1, 1]) {
  return mesh(new THREE.IcosahedronGeometry(radius, segments), material, name, pos, [0, 0, 0], scale);
}

function islandBase(name, radius, height, topColor, seed = 0) {
  const group = new THREE.Group();
  group.name = `${name}_terrain`;
  group.add(cylinder(radius * 0.88, radius, height * 0.28, 11, mat(topColor), `${name}_grass_upper`, [0, 0.05, 0]));
  group.add(cylinder(radius * 0.67, radius * 0.9, height * 0.36, 11, mat(C.rockLight), `${name}_rock_middle`, [0, -height * 0.27, 0], [0, seed * 0.13, 0]));
  group.add(cylinder(radius * 0.12, radius * 0.68, height * 0.58, 11, mat(C.rock), `${name}_rock_lower`, [0, -height * 0.72, 0], [0, seed * 0.21, 0]));
  return group;
}

function tree(name, pos, scale = 1, foliage = C.greenLight) {
  const group = new THREE.Group();
  group.name = name;
  group.position.set(...pos);
  group.add(cylinder(0.12 * scale, 0.16 * scale, 0.7 * scale, 7, mat(0x765033), `${name}_trunk`, [0, 0.35 * scale, 0]));
  group.add(sphere(0.48 * scale, 1, mat(foliage), `${name}_crown`, [0, 0.95 * scale, 0], [1, 0.85, 1]));
  return group;
}

function palace(name, pos, scale = 1) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(...pos);
  g.scale.setScalar(scale);
  g.add(box([1.8, 0.55, 1.1], mat(C.brick), `${name}_body`, [0, 0.28, 0]));
  const roof = cylinder(0.85, 1.2, 0.36, 4, mat(C.roof), `${name}_roof`, [0, 0.72, 0], [0, Math.PI / 4, 0]);
  roof.scale.z = 0.75;
  g.add(roof);
  g.add(box([0.13, 0.65, 0.13], mat(C.orange), `${name}_pillar_l`, [-0.55, 0.32, 0.56]));
  g.add(box([0.13, 0.65, 0.13], mat(C.orange), `${name}_pillar_r`, [0.55, 0.32, 0.56]));
  return g;
}

function pingAn(name, pos, scale = 1) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(...pos);
  g.scale.setScalar(scale);
  g.add(cylinder(0.42, 0.65, 2.8, 6, mat(C.tower), `${name}_body`, [0, 1.4, 0]));
  g.add(cylinder(0.08, 0.26, 0.85, 6, mat(C.tower), `${name}_spire`, [0, 3.2, 0]));
  return g;
}

function pearlTower(name, pos, scale = 1) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(...pos);
  g.scale.setScalar(scale);
  g.add(cylinder(0.08, 0.12, 2.1, 8, mat(C.stone), `${name}_shaft`, [0, 1.05, 0]));
  g.add(sphere(0.42, 1, mat(C.pearl), `${name}_orb_lower`, [0, 0.72, 0]));
  g.add(sphere(0.28, 1, mat(C.pearl), `${name}_orb_upper`, [0, 1.62, 0]));
  g.add(cylinder(0.03, 0.05, 0.7, 6, mat(C.pearl), `${name}_antenna`, [0, 2.45, 0]));
  return g;
}

function bridge(name, pos, scale = 1) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(...pos);
  g.scale.setScalar(scale);
  for (let i = -2; i <= 2; i++) {
    const y = 0.18 + 0.1 * (1 - Math.abs(i) / 2);
    g.add(box([0.42, 0.16, 0.7], mat(C.stone), `${name}_segment_${i + 2}`, [i * 0.36, y, 0]));
  }
  return g;
}

function createInternshipIsland() {
  const island = new THREE.Group();
  island.name = "island_internship";
  island.userData = { selectable: true, category: "internship", label: "实习经历" };
  island.position.set(-3.25, 0, 0.55);
  island.add(islandBase("internship", 3.15, 2.65, C.green, 1));
  island.add(cylinder(1.3, 1.5, 0.5, 9, mat(C.greenLight), "internship_high_terrace", [-0.8, 0.45, -0.65]));
  island.add(palace("beijing_forbidden_city", [-0.85, 0.72, -0.75], 0.95));
  island.add(pingAn("shenzhen_ping_an", [-1.95, 0.25, 0.65], 0.66));
  island.add(pearlTower("shanghai_oriental_pearl", [0.75, 0.24, 0.35], 0.72));
  island.add(cylinder(1.1, 1.25, 0.22, 10, mat(C.water), "hangzhou_west_lake", [0.6, 0.23, 1.7]));
  island.add(bridge("hangzhou_bridge", [0.55, 0.35, 1.7], 0.65));
  island.add(tree("hangzhou_willow", [1.55, 0.3, 1.55], 0.75, 0x87aa45));
  island.add(tree("internship_tree_1", [-2.2, 0.22, -1.1], 0.65));
  island.add(tree("internship_tree_2", [1.5, 0.22, -1.25], 0.58));
  return island;
}

function futureBuilding(name, pos, size, color = C.purple) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(...pos);
  g.add(cylinder(size[0] * 0.42, size[0] * 0.55, size[1], 7, mat(color), `${name}_body`, [0, size[1] / 2, 0]));
  for (let i = 0; i < 3; i++) {
    g.add(box([size[0] * 0.58, 0.08, size[0] * 0.05], mat(C.cyan, C.cyan, 1.4), `${name}_light_${i}`, [0, size[1] * (0.3 + i * 0.18), size[0] * 0.48]));
  }
  return g;
}

function robot(name, pos, scale = 1) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(...pos);
  g.scale.setScalar(scale);
  g.add(cylinder(0.35, 0.42, 0.62, 10, mat(C.white), `${name}_body`, [0, 0.42, 0]));
  g.add(sphere(0.42, 1, mat(C.white), `${name}_head`, [0, 0.95, 0], [1, 0.72, 0.85]));
  g.add(box([0.48, 0.18, 0.38], mat(C.dark), `${name}_face`, [0, 0.97, 0.31]));
  g.add(sphere(0.055, 1, mat(C.cyan, C.cyan, 2), `${name}_eye_l`, [-0.12, 0.98, 0.51]));
  g.add(sphere(0.055, 1, mat(C.cyan, C.cyan, 2), `${name}_eye_r`, [0.12, 0.98, 0.51]));
  g.add(cylinder(0.09, 0.09, 0.5, 7, mat(C.white), `${name}_arm_l`, [-0.42, 0.56, 0], [0, 0, -0.65]));
  g.add(cylinder(0.09, 0.09, 0.5, 7, mat(C.white), `${name}_arm_r`, [0.42, 0.56, 0], [0, 0, 0.65]));
  return g;
}

function flyingCar(name, pos, scale = 1) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(...pos);
  g.scale.setScalar(scale);
  g.add(box([1.05, 0.34, 0.55], mat(C.dark), `${name}_body`, [0, 0, 0]));
  g.add(box([0.55, 0.24, 0.48], mat(C.tower), `${name}_cabin`, [-0.05, 0.25, 0]));
  g.add(box([0.18, 0.07, 0.57], mat(C.cyan, C.cyan, 2), `${name}_light_front`, [0.53, -0.04, 0]));
  return g;
}

function createAIIsland() {
  const island = new THREE.Group();
  island.name = "island_ai";
  island.userData = { selectable: true, category: "ai", label: "个人 AI 实践" };
  island.position.set(3.2, 0, 0.45);
  island.add(islandBase("ai", 3.1, 2.75, C.purple, 2));
  island.add(cylinder(1.7, 1.9, 0.48, 10, mat(0x7962b9), "ai_city_upper_platform", [0.6, 0.48, -0.65]));
  island.add(cylinder(1.05, 1.2, 0.35, 10, mat(0x947bd0), "ai_robot_plaza", [-1.25, 0.34, 1.05]));
  island.add(futureBuilding("ai_tower_main", [0.7, 0.72, -0.85], [1.15, 3.3], C.indigo));
  island.add(futureBuilding("ai_tower_curved", [-0.45, 0.72, -0.55], [0.95, 2.0], C.purpleDark));
  const dome = new THREE.Group();
  dome.name = "ai_dome";
  dome.position.set(1.55, 0.69, 0.35);
  dome.add(cylinder(0.8, 0.9, 0.38, 10, mat(C.purpleDark), "ai_dome_base", [0, 0.19, 0]));
  dome.add(sphere(0.74, 1, mat(0x9a80d9), "ai_dome_top", [0, 0.55, 0], [1, 0.55, 1]));
  dome.add(cylinder(0.78, 0.78, 0.08, 16, mat(C.cyan, C.cyan, 1.4), "ai_dome_ring", [0, 0.55, 0]));
  island.add(dome);
  const track = mesh(new THREE.TorusGeometry(2.15, 0.10, 6, 24, Math.PI * 1.55), mat(C.stone), "ai_sky_track", [0.5, 2.05, -0.25], [Math.PI / 2, 0, -0.25]);
  island.add(track);
  island.add(flyingCar("ai_flying_car", [2.22, 2.25, -1.0], 0.72));
  island.add(robot("ai_robot", [-1.25, 0.72, 1.05], 0.75));
  return island;
}

function student(name, pos, shirt) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(...pos);
  g.add(cylinder(0.28, 0.32, 0.7, 8, mat(shirt), `${name}_body`, [0, 0.55, 0]));
  g.add(sphere(0.3, 1, mat(C.skin), `${name}_head`, [0, 1.08, 0]));
  g.add(sphere(0.31, 1, mat(0x4c3326), `${name}_hair`, [0, 1.24, -0.04], [1, 0.55, 1]));
  g.add(cylinder(0.08, 0.08, 0.48, 7, mat(C.skin), `${name}_arm`, [0.33, 0.72, 0.18], [0.55, 0.1, -0.65]));
  return g;
}

function arch(name, pos) {
  const g = new THREE.Group();
  g.name = name;
  g.position.set(...pos);
  g.add(box([0.35, 1.65, 0.45], mat(C.cream), `${name}_left`, [-0.75, 0.82, 0]));
  g.add(box([0.35, 1.65, 0.45], mat(C.cream), `${name}_right`, [0.75, 0.82, 0]));
  g.add(mesh(new THREE.TorusGeometry(0.75, 0.2, 6, 12, Math.PI), mat(C.cream), `${name}_curve`, [0, 1.55, 0], [0, 0, 0]));
  return g;
}

function prototype(group, prefix, startX, refined = false) {
  const count = refined ? 3 : 6;
  for (let i = 0; i < count; i++) {
    const x = startX + (i % 3) * 0.18;
    const z = (Math.floor(i / 3) - 0.5) * 0.2;
    const h = refined ? 0.18 + i * 0.05 : 0.12 + (i % 2) * 0.13;
    group.add(box([0.16, h, 0.16], mat(C.white), `${prefix}_${i}`, [x, 0.58 + h / 2, z]));
  }
}

function createSchoolIsland() {
  const island = new THREE.Group();
  island.name = "island_school";
  island.userData = { selectable: true, category: "school", label: "学校项目" };
  island.position.set(0, 1.05, -3.15);
  island.add(islandBase("school", 2.65, 2.35, C.cream, 3));
  island.add(cylinder(2.1, 2.3, 0.38, 10, mat(0xe8d4ad), "school_upper_terrace", [0, 0.38, 0]));
  const table = box([2.5, 0.18, 1.15], mat(C.wood), "school_worktable", [0, 0.86, 0.15]);
  island.add(table);
  island.add(box([0.16, 0.65, 0.16], mat(C.wood), "table_leg_1", [-1, 0.52, -0.25]));
  island.add(box([0.16, 0.65, 0.16], mat(C.wood), "table_leg_2", [1, 0.52, -0.25]));
  prototype(island, "rough_prototype", -0.85, false);
  prototype(island, "refined_prototype", 0.48, true);
  const arrow = mesh(new THREE.ConeGeometry(0.22, 0.52, 3), mat(C.stone), "iteration_arrow", [0.08, 1.05, 0.05], [0, 0, -Math.PI / 2]);
  island.add(arrow);
  island.add(student("student_left", [-1.25, 0.7, 0.55], C.orange));
  const right = student("student_right", [1.25, 0.7, 0.55], 0x42745c);
  right.rotation.y = Math.PI;
  island.add(right);
  island.add(arch("school_arch", [0, 0.6, -1.35]));
  island.add(tree("school_tree", [1.75, 0.48, -1.1], 0.9, 0x8cab46));
  return island;
}

export function createExperienceIslandsScene() {
  const scene = new THREE.Scene();
  scene.name = "experience_islands_scene";
  scene.background = new THREE.Color(0xf2eee7);
  scene.add(new THREE.HemisphereLight(0xfff8e8, 0x514b47, 2.4));
  const sun = new THREE.DirectionalLight(0xffffff, 3.1);
  sun.name = "key_light";
  sun.position.set(-8, 12, 7);
  sun.castShadow = true;
  scene.add(sun);
  const root = new THREE.Group();
  root.name = "experience_islands_root";
  root.add(createInternshipIsland(), createAIIsland(), createSchoolIsland());
  for (let i = 0; i < 5; i++) {
    const a = i * 1.37;
    const r = 6.2 + (i % 2) * 0.8;
    root.add(sphere(0.24 + (i % 3) * 0.08, 1, mat(i % 2 ? C.rockLight : C.rock), `floating_rock_${i + 1}`, [Math.cos(a) * r, -1.4 - (i % 2) * 0.5, Math.sin(a) * r]));
  }
  scene.add(root);
  return scene;
}

export function getSelectableIslandNames() {
  return ["island_internship", "island_ai", "island_school"];
}
