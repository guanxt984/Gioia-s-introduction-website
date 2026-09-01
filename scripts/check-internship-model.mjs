import fs from "node:fs/promises";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";

const file = path.resolve("public/models/island-internship-final.glb");
const stat = await fs.stat(file);
const io = new NodeIO();
const document = await io.read(file);
const root = document.getRoot();
const nodes = root.listNodes();
const meshes = root.listMeshes();
const materials = root.listMaterials();
const names = new Set(nodes.map((node) => node.getName()));

let triangles = 0;
for (const mesh of meshes) {
  for (const primitive of mesh.listPrimitives()) {
    const indices = primitive.getIndices();
    const positions = primitive.getAttribute("POSITION");
    triangles += indices ? indices.getCount() / 3 : (positions?.getCount() ?? 0) / 3;
  }
}

const requiredNames = [
  "island_internship",
  "Faceted Rock Body",
  "Continuous Grass Terrain",
  "Hall of Supreme Harmony Hall Body",
  "Ping An Main Shaft",
  "Pearl Lower Sphere",
  "West Lake Water",
];
const missing = requiredNames.filter((name) => !names.has(name));
const report = {
  file,
  bytes: stat.size,
  megabytes: +(stat.size / 1024 / 1024).toFixed(3),
  nodeCount: nodes.length,
  meshCount: meshes.length,
  materialCount: materials.length,
  triangleCount: Math.round(triangles),
  requiredNodes: Object.fromEntries(requiredNames.map((name) => [name, names.has(name)])),
};

console.log(JSON.stringify(report, null, 2));
if (missing.length) throw new Error(`Missing required nodes: ${missing.join(", ")}`);
if (stat.size > 4 * 1024 * 1024) throw new Error(`Internship island exceeds 4 MB: ${report.megabytes} MB`);
if (triangles < 30000) throw new Error(`Internship island is below the 30k fidelity floor: ${triangles}`);
if (triangles > 60000) throw new Error(`Internship island exceeds 60k triangles: ${triangles}`);
if (materials.length > 12) throw new Error(`Internship island exceeds 12 materials: ${materials.length}`);
