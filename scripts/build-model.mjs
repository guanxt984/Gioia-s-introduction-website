import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { GLTFExporter } from "three/examples/jsm/exporters/GLTFExporter.js";
import { createExperienceIslandsScene } from "../src/experience-islands.js";

class NodeFileReader {
  result = null;
  onloadend = null;

  async readAsArrayBuffer(blob) {
    this.result = await blob.arrayBuffer();
    queueMicrotask(() => this.onloadend?.());
  }

  async readAsDataURL(blob) {
    const buffer = Buffer.from(await blob.arrayBuffer());
    this.result = `data:${blob.type || "application/octet-stream"};base64,${buffer.toString("base64")}`;
    queueMicrotask(() => this.onloadend?.());
  }
}

if (!globalThis.FileReader) globalThis.FileReader = NodeFileReader;

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const publicDir = path.join(root, "public");
const modelDir = path.join(publicDir, "models");
const vendorDir = path.join(publicDir, "vendor");
await fs.mkdir(modelDir, { recursive: true });
await fs.mkdir(vendorDir, { recursive: true });

const exporter = new GLTFExporter();

async function exportGLB(object, filename) {
  object.updateMatrixWorld(true);
  const arrayBuffer = await new Promise((resolve, reject) => {
    exporter.parse(
      object,
      result => resolve(result),
      error => reject(error),
      {
        binary: true,
        onlyVisible: true,
        truncateDrawRange: true,
        includeCustomExtensions: false,
      },
    );
  });
  await fs.writeFile(path.join(modelDir, filename), Buffer.from(arrayBuffer));
}

const scene = createExperienceIslandsScene();
await exportGLB(scene, "experience-islands.glb");
const rootNode = scene.getObjectByName("experience_islands_root");
for (const [nodeName, filename] of [
  ["island_internship", "island-internship.glb"],
  ["island_ai", "island-ai.glb"],
  ["island_school", "island-school.glb"],
]) {
  const source = rootNode.getObjectByName(nodeName);
  const clone = source.clone(true);
  clone.position.set(0, 0, 0);
  await exportGLB(clone, filename);
}
await fs.copyFile(path.join(root, "node_modules/three/build/three.module.js"), path.join(vendorDir, "three.module.js"));
await fs.copyFile(path.join(root, "node_modules/three/examples/jsm/controls/OrbitControls.js"), path.join(vendorDir, "OrbitControls.js"));
await fs.copyFile(path.join(root, "node_modules/three/examples/jsm/loaders/GLTFLoader.js"), path.join(vendorDir, "GLTFLoader.js"));
console.log(`Built GLB assets in ${modelDir}`);
