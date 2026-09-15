import fs from 'node:fs';
import assert from 'node:assert/strict';

const js = fs.readFileSync('public/home-cards.js', 'utf8');
const css = fs.readFileSync('public/home-cards.css', 'utf8');
const layoutSource = fs.readFileSync('public/justified-media-layout.js', 'utf8');
const combinedJs = js + layoutSource;

assert.match(js, /function orderCardMedia/);
assert.match(js, /大图/);
assert.match(js, /dataset\.cardId/);
assert.match(js, /dataset\.mediaCount/);
assert.match(css, /overflow:\s*hidden/);
assert.match(css, /gap:\s*4px/);
assert.match(css, /rgb\(238 238 238 \/ 80%\)/);
assert.match(css, /color:\s*#fe5416/);
assert.match(css, /font-weight:\s*700/);
assert.match(combinedJs, /function solveJustifiedMosaic/);
assert.match(combinedJs, /function enumeratePartitions/);
assert.match(js, /function partitionsForCard/);
assert.match(js, /assets\.slice\(1, 5\), assets\.slice\(5, 9\)/);
assert.match(combinedJs, /mediaArea/);
assert.match(combinedJs, /row\.reduce\(\(sum, asset\) => sum \+ asset\.aspect/);
assert.match(css, /\.home-card-media-row/);
assert.doesNotMatch(css, /grid-template-columns/);
const detailCss = css.slice(css.indexOf('.home-card-media'));
assert.doesNotMatch(detailCss, /object-fit:\s*(cover|contain)/);
assert.match(css, /home-card-wiggle 1s/);
assert.match(css, /animation-play-state:\s*paused, running/);
assert.match(css, /orbit:hover \.tile \{ animation-play-state:\s*running/);
assert.match(css, /orbit:has\(\.tile:hover\) \.tile \{ animation-play-state:\s*paused/);
assert.match(css, /orbit:has\(\.tile:hover\) \.tile:hover[\s\S]*animation-play-state:\s*paused, running/);
assert.match(css, /scale\(1\.06\)/);
console.log('Home card layout contract verified.');

const { solveJustifiedMosaic } = await import('../public/justified-media-layout.js');
const { partitionsForCard } = await import('../public/home-cards.js');
const sample = [{ aspect: 1 }, { aspect: 1.5 }, { aspect: 0.75 }, { aspect: 16 / 9 }];
const layout = solveJustifiedMosaic(sample, 1000, 700, 4);
assert.ok(layout.width <= 1000 && layout.height <= 700);
layout.rows.forEach((row, index) => {
  const occupiedWidth = row.reduce((sum, asset) => sum + asset.aspect * layout.heights[index], 0) + (row.length - 1) * 4;
  assert.ok(Math.abs(occupiedWidth - layout.width) < 0.001, 'each justified row must exactly fill its width');
});
const nine = Array.from({ length: 9 }, (_, index) => ({ aspect: 1, name: `${index}` }));
assert.deepEqual(partitionsForCard({ id: 'lixiang' }, nine)[0].map(row => row.length), [1, 4, 4]);
assert.deepEqual(partitionsForCard({ id: 'baimi' }, nine.slice(0, 4))[0].map(row => row.length), [1, 3]);
