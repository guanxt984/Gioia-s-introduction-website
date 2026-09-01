import fs from "node:fs/promises";
import path from "node:path";
import { NodeIO } from "@gltf-transform/core";

const file = path.resolve("public/models/experience-islands.glb");
const stat = await fs.stat(file);
const io = new NodeIO();
const document = await io.read(file);
const root = document.getRoot();
const nodes = root.listNodes();
const meshes = root.listMeshes();
const names = new Set(nodes.map(node => node.getName()));
const required = ["island_internship", "island_ai", "island_school"];
const missing = required.filter(name => !names.has(name));
let triangles = 0;
for (const value of meshes) {
  for (const primitive of value.listPrimitives()) {
    const indices = primitive.getIndices();
    const position = primitive.getAttribute("POSITION");
    triangles += indices ? indices.getCount() / 3 : (position?.getCount() ?? 0) / 3;
  }
}

const report = {
  file,
  bytes: stat.size,
  megabytes: +(stat.size / 1024 / 1024).toFixed(3),
  nodeCount: nodes.length,
  meshCount: meshes.length,
  triangleCount: Math.round(triangles),
  requiredNodes: Object.fromEntries(required.map(name => [name, names.has(name)])),
};
console.log(JSON.stringify(report, null, 2));
if (missing.length) throw new Error(`Missing required island nodes: ${missing.join(", ")}`);
if (stat.size > 5 * 1024 * 1024) throw new Error(`GLB exceeds 5 MB: ${report.megabytes} MB`);
if (triangles > 100000) throw new Error(`Triangle count exceeds 100k: ${triangles}`);
