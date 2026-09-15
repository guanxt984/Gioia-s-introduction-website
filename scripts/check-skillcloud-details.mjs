import { createRequire } from 'node:module';
import path from 'node:path';
// Use local Playwright, or set PLAYWRIGHT_MODULE_ROOT to a bundled node_modules directory.
const require = createRequire(import.meta.url);
const { chromium } = require(process.env.PLAYWRIGHT_MODULE_ROOT ? path.join(process.env.PLAYWRIGHT_MODULE_ROOT, 'playwright') : 'playwright');
import { skillDetails } from '../public/skillcloud-content.js';
import fs from 'node:fs';
import assert from 'node:assert/strict';
const markdown = fs.readFileSync('skillcloud-content.md','utf8');
assert.equal(Object.keys(skillDetails).length,12);
for (const item of Object.values(skillDetails)) {
  const section = markdown.split(`## ${item.title}\n`)[1]?.split('\n---')[0] ?? markdown.replaceAll('\r','').split(`## ${item.title}\n`)[1]?.split('\n---')[0];
  assert.ok(section, item.title);
  assert.ok(section.includes(`**Hook：${item.hook}**`));
  assert.equal(item.evidence.length, item.id === 'data-analysis' ? 2 : 3);
  for (const evidence of item.evidence) assert.ok(section.includes(evidence.text));
}
const browser = await chromium.launch({headless:true,channel:'msedge'});
const page = await browser.newPage();
async function clickMoving(selector) {
  const element = page.locator(selector);
  await element.evaluate(el => el.scrollIntoView({block:"center",behavior:"instant"}));
  const box = await element.boundingBox();
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}
const errors=[];
page.on('pageerror',error=>errors.push(error.message));
for (const viewport of [{width:1440,height:1000},{width:390,height:844},{width:320,height:568}]) {
  await page.setViewportSize(viewport);
  await page.goto('http://127.0.0.1:4173/');
  await page.locator('[data-skill-id="insight"]').waitFor();
  for (const item of Object.values(skillDetails)) {
    const chip = page.locator(`[data-skill-id="${item.id}"]`);
    await chip.evaluate(el => el.scrollIntoView({block:"center",behavior:"instant"}));
    const box = await chip.boundingBox();
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
    const dialog = page.locator('.skill-detail-dialog');
    assert.equal(await dialog.getAttribute('open'),'');
    assert.equal(await dialog.locator('[data-skill-title]').textContent(),item.title);
    assert.equal(await dialog.locator('[data-skill-body]').textContent(),item.hook);
    assert.equal(await dialog.locator('li').count(),item.evidence.length);
    for (let i=0;i<item.evidence.length;i++) {
      assert.equal(await dialog.locator('li p').nth(i).textContent(),item.evidence[i].text);
      assert.equal(await dialog.locator('li h4').nth(i).textContent(),[item.evidence[i].project,item.evidence[i].title].filter(Boolean).join(' · '));
    }
    const geometry = await dialog.evaluate(el=>({width:el.clientWidth,scrollWidth:el.scrollWidth,rect:el.getBoundingClientRect().toJSON(),bodyLines:el.querySelector('[data-skill-body]').clientHeight/parseFloat(getComputedStyle(el.querySelector('[data-skill-body]')).lineHeight)}));
    assert.ok(geometry.scrollWidth<=geometry.width+1,JSON.stringify(geometry));
    assert.ok(geometry.rect.top>=0 && geometry.rect.bottom<=viewport.height+1);
    if (viewport.width===1440) assert.ok(geometry.bodyLines<=2.1,`${item.title}: ${geometry.bodyLines} lines`);
    await dialog.locator('li').last().scrollIntoViewIfNeeded();
    if(item.id==='design-visualization' && process.env.SKILLCLOUD_SCREENSHOT_DIR) {
      fs.mkdirSync(process.env.SKILLCLOUD_SCREENSHOT_DIR, {recursive:true});
      await page.screenshot({path:path.join(process.env.SKILLCLOUD_SCREENSHOT_DIR, `skillcloud-tool-${viewport.width}.png`)});
    }
    await page.keyboard.press('Escape');
    assert.equal(await dialog.getAttribute('open'),null);
    console.log(`${viewport.width}px PASS ${item.title} (${item.evidence.length})`);
  }
  await clickMoving('[data-skill="象棋"]');
  assert.equal(await page.locator('.skill-detail-dialog.is-media-only img').count(),1);
  assert.equal(await page.locator('.skill-evidence-list').count(),0);
  await page.keyboard.press('Escape');
  await clickMoving('[data-skill="代码基础"]');
  assert.equal(await page.locator('.has-skill-content').count(),1);
  await page.locator('.skill-detail-close').click();
}
assert.deepEqual(errors,[]);
await browser.close();
console.log('All 36 click/content/layout checks and Energy regression checks passed.');

