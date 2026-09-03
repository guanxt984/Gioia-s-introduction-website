import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(".");
const model = path.join(root, "public/models/experience-island-uploaded-preview.glb");
const viewer = await fs.readFile(path.join(root, "src/viewer.js"), "utf8");
const portfolio = await fs.readFile(path.join(root, "src/portfolio-island.js"), "utf8");
const index = await fs.readFile(path.join(root, "public/index.html"), "utf8");
const server = await fs.readFile(path.join(root, "scripts/serve.mjs"), "utf8");
const html = await fs.readFile(path.join(root, "public/experience-islands-viewer.html"), "utf8");

const stat = await fs.stat(model);
const bytes = await fs.readFile(model);
const maxAssetBytes = 25 * 1024 * 1024;
assert.ok(stat.size <= maxAssetBytes, "uploaded preview must fit Cloudflare's 25 MiB asset limit");
assert.equal(bytes.subarray(0, 4).toString("ascii"), "glTF", "uploaded preview must remain a binary glTF");
assert.equal(bytes.readUInt32LE(4), 2, "uploaded preview must remain glTF 2.0");
assert.equal(bytes.readUInt32LE(8), stat.size, "GLB header length must match the file size");
for (const name of ["tripo_part_0", "tripo_part_3", "tripo_part_4", "tripo_part_5", "tripo_part_8", "tripo_part_9", "tripo_part_14"]) {
  assert.ok(bytes.includes(Buffer.from(name)), `uploaded preview must retain interactive node ${name}`);
}
assert.match(viewer, /uploaded:\s*["']\.\/models\/experience-island-uploaded-preview\.glb["']/);
assert.match(viewer, /\u4f18\u5316\u6a21\u578b 23 MB \/ 95\.4 \u4e07\u4e09\u89d2\u9762/);
assert.ok((viewer.match(/\u4f18\u5316\u6a21\u578b 23 MB \/ 95\.4 \u4e07\u4e09\u89d2\u9762/g) || []).length >= 2);
assert.match(html, /\.buttons\[hidden\]\s*\{\s*display:\s*none/);
assert.match(server, /["']Content-Length["']:\s*stat\.size/);

const modelPaths = new Set(
  [...`${viewer}\n${portfolio}\n${index}`.matchAll(/(?:\.\/)?models\/[^"'`)\s]+\.glb/g)]
    .map(match => match[0].replace(/^\.\//, "")),
);
for (const modelPath of modelPaths) await fs.access(path.join(root, "public", modelPath));

console.log(JSON.stringify({ status: "PASS", modelBytes: stat.size, modelPaths: [...modelPaths].sort() }, null, 2));
