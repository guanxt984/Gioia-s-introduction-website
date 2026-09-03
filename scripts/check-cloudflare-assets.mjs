import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";

const root = path.resolve("public");
const maxAssetBytes = 25 * 1024 * 1024;

async function collectFiles(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = [];

  for (const entry of entries) {
    const absolute = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await collectFiles(absolute));
    if (entry.isFile()) files.push(absolute);
  }

  return files;
}

const files = await collectFiles(root);
const oversized = [];
const lfsPointers = [];

for (const file of files) {
  const { size } = await fs.stat(file);
  if (size < 1024) {
    const content = await fs.readFile(file);
    if (content.subarray(0, 42).toString("utf8") === "version https://git-lfs.github.com/spec/v1") {
      lfsPointers.push(path.relative(root, file).replaceAll(path.sep, "/"));
    }
  }
  if (size > maxAssetBytes) {
    oversized.push({
      file: path.relative(root, file).replaceAll(path.sep, "/"),
      bytes: size,
      mebibytes: Number((size / 1024 / 1024).toFixed(3)),
    });
  }
}

assert.deepEqual(
  oversized,
  [],
  `Cloudflare Workers assets must be <= 25 MiB:\n${JSON.stringify(oversized, null, 2)}`,
);
assert.deepEqual(lfsPointers, [], `Public assets must be materialized, not LFS pointers: ${lfsPointers.join(", ")}`);

console.log(JSON.stringify({ status: "PASS", files: files.length, maxAssetBytes }, null, 2));
