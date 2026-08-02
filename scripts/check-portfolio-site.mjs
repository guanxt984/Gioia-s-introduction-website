import assert from "node:assert/strict";
import fs from "node:fs/promises";

const index = await fs.readFile("public/index.html", "utf8");
const required = [
  "homepage-viewport-fit-v5.html",
  "full-five-page-structure-v8.html",
  "full-five-page-coveo-render-v9.html",
  "full-five-page-reviewed-v10.html",
];

for (const file of required) {
  await fs.access(`public/site/${file}`);
  assert.match(index, new RegExp(`\\./site/${file.replaceAll(".", "\\.")}`));
}

const structure = await fs.readFile("public/site/full-five-page-structure-v8.html", "utf8");
assert.doesNotMatch(index, /\/files\//);
assert.match(index, /data-portfolio-version=["']v11["']/);
assert.match(structure, /id=["']experience["']/);

console.log(JSON.stringify({ status: "PASS", checks: "stable V11 shell" }, null, 2));
