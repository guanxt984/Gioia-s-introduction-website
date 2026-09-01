import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve(".");
const model = path.join(root, "public/models/experience-island-uploaded-preview.glb");
const viewer = await fs.readFile(path.join(root, "src/viewer.js"), "utf8");
const server = await fs.readFile(path.join(root, "scripts/serve.mjs"), "utf8");
const html = await fs.readFile(path.join(root, "public/experience-islands-viewer.html"), "utf8");

const stat = await fs.stat(model);
assert.ok(stat.size > 30_000_000, "uploaded preview must use the provided original GLB");
assert.match(viewer, /uploaded:\s*["']\.\/models\/experience-island-uploaded-preview\.glb["']/);
assert.match(viewer, /\u539f\u59cb\u6a21\u578b 32 MB \/ 95\.4 \u4e07\u4e09\u89d2\u9762/);
assert.ok((viewer.match(/\u539f\u59cb\u6a21\u578b 32 MB \/ 95\.4 \u4e07\u4e09\u89d2\u9762/g) || []).length >= 2);
assert.match(html, /\.buttons\[hidden\]\s*\{\s*display:\s*none/);
assert.match(server, /["']Content-Length["']:\s*stat\.size/);

console.log(JSON.stringify({ status: "PASS", modelBytes: stat.size }, null, 2));
