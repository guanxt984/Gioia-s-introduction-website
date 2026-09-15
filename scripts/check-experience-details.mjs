import fs from 'node:fs';
import assert from 'node:assert/strict';

const source = fs.readFileSync('src/portfolio-island.js', 'utf8');
const css = fs.readFileSync('public/experience-details.css', 'utf8');
const required = [
  'internship/lixiang/certificate.webp',
  'internship/qianchuan/certificate.webp',
  'internship/baimi/proof.webp',
  'internship/jiuling/agreement.webp',
  'school/uiux/ux.webp',
  'school/apex/demo.mp4',
  'school/apex/section.webp',
];
required.forEach(relative => {
  assert.ok(source.includes(relative), `mapping missing ${relative}`);
  assert.ok(fs.existsSync(`public/assets/experience-island-details/${relative}`), `asset missing ${relative}`);
});
assert.match(source, /solveJustifiedMosaic/);
assert.match(source, /probe\.videoWidth \/ probe\.videoHeight/);
assert.match(css, /\.school-project-media-row/);
assert.doesNotMatch(source, /showModal\(/);
assert.doesNotMatch(source, /experienceDialog/);
assert.doesNotMatch(css, /object-fit:\s*(cover|contain)/);
assert.match(css, /overflow:\s*hidden/);
console.log('Experience Island details verified.');
