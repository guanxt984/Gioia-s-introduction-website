import assert from 'node:assert/strict';
import fs from 'node:fs';
import { skillDetails } from '../public/skillcloud-content.js';

const groups = {
  PRODUCT: ['需求洞察', '产品规划', '体验设计', '数据驱动'],
  AI: ['AI 产品实战', 'AI 评测', '模型选型', 'Prompt / Context Engineering'],
  BUILD: ['快速原型', '软硬件落地', 'AI 协作开发', '多模态表达'],
};
const ids = [
  'insight', 'product-planning', 'experience-design', 'data-driven',
  'ai-product-practice', 'ai-evaluation', 'model-selection', 'prompt-context-engineering',
  'rapid-prototyping', 'software-hardware-delivery', 'ai-assisted-development', 'multimodal-expression',
];
assert.deepEqual(Object.keys(skillDetails), ids);
for (const [group, titles] of Object.entries(groups)) {
  const members = Object.values(skillDetails).filter(skill => skill.group === group);
  assert.deepEqual(members.map(skill => skill.title), titles, `${group} title and order`);
  for (const skill of members) {
    assert.ok(skill.evidence.length === 2 || skill.evidence.length === 3, `${skill.title} has two or three cards`);
    for (const evidence of skill.evidence) {
      assert.ok(evidence.title && evidence.text, `${skill.title} evidence needs a title and body`);
      for (const highlight of evidence.highlights || []) assert.ok(evidence.text.includes(highlight), `${skill.title}: highlight must match source text`);
    }
  }
}
const template = fs.readFileSync('public/site/full-five-page-structure-v8.html', 'utf8');
for (const [group, titles] of Object.entries(groups)) {
  const section = template.match(new RegExp(`<section class="skill-cloud-zone [^"]+" aria-label="${group}[^\\"]*">([\\s\\S]*?)<\\/section>`));
  assert.ok(section, `${group} cloud exists`);
  for (const title of titles) assert.match(section[1], new RegExp(`data-skill="${title.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\$&')}"`));
}
const thinkCloud = template.match(/<section class="skill-cloud-zone think"[\s\S]*?<\/section>/)?.[0] || '';
const toolCloud = template.match(/<section class="skill-cloud-zone tool"[\s\S]*?<\/section>/)?.[0] || '';
assert.match(thinkCloud, /aria-label="PRODUCT 产品能力"/);
assert.match(toolCloud, /aria-label="BUILD 落地能力"/);
const index = fs.readFileSync('public/index.html', 'utf8');
const css = fs.readFileSync('public/skillcloud-details.css', 'utf8');
assert.match(index, /data-skill-group/);
assert.match(index, /evidence\.highlights/);
assert.match(index, /function skillChipAtPoint/);
assert.match(index, /dialog\.show\(\)/);
assert.match(template, /skill-detail-dialog\[open\]:not\(:modal\)::before/);
assert.match(template, /pointer-events:\s*none/);
assert.match(css, /data-count="2"/);
assert.match(css, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
assert.match(css, /skill-evidence-highlight/);
assert.match(css, /width:\s*calc\(100vw - 64px\)/);
console.log('Skill cloud data and UI contract passed.');
import { createRequire } from 'node:module';
import path from 'node:path';
const require = createRequire(import.meta.url);
const moduleRoot = process.env.PLAYWRIGHT_MODULE_ROOT;
const { chromium } = require(moduleRoot ? path.join(moduleRoot, 'playwright') : 'playwright');
const browser = await chromium.launch({ headless: true, channel: 'msedge' });
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  await context.addInitScript(() => localStorage.setItem('portfolio.skillCloud.viewed.v1', JSON.stringify({ '需求洞察': true, 'AI 产品设计': true, '评测与迭代': true, '象棋': true })));
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto('http://127.0.0.1:4173/', { waitUntil: 'domcontentloaded' });
  await page.locator('.skill-detail-dialog').waitFor({ state: 'attached' });
  await page.locator('[data-skill-id="insight"]').waitFor({ state: 'attached' });
  assert.equal(await page.locator('[data-skill-id="insight"]').evaluate(el => el.classList.contains('is-viewed')), true, 'old insight viewed state is recognized');
  assert.equal(await page.locator('[data-skill-id="ai-product-practice"]').evaluate(el => el.classList.contains('is-viewed')), true, 'renamed product skill inherits its viewed state');
  assert.equal(await page.locator('[data-skill-id="ai-evaluation"]').evaluate(el => el.classList.contains('is-viewed')), true, 'AI evaluation inherits its viewed state');
  assert.equal(await page.locator('[data-skill-id="model-selection"]').evaluate(el => el.classList.contains('is-viewed')), false, 'unrelated skills do not inherit viewed state');
  assert.equal(await page.locator('[data-skill="象棋"]').evaluate(el => el.classList.contains('is-viewed')), true, 'Energy retains its viewed state');

  async function clickThroughDialog(id) {
    const chip = page.locator(`[data-skill-id="${id}"]`);
    await chip.evaluate(el => el.scrollIntoView({ block: 'center', behavior: 'instant' }));
    const box = await chip.boundingBox();
    assert.ok(box, `${id}: chip is visible for hit testing`);
    await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  }

  for (const viewport of [{ width: 1440, height: 1000 }, { width: 390, height: 844 }]) {
    await page.setViewportSize(viewport);
    const items = Object.values(skillDetails);
    for (let index = 0; index < items.length; index++) {
      const item = items[index];
      const chip = page.locator(`[data-skill-id="${item.id}"]`);
      assert.equal(await chip.getAttribute('data-zone'), item.group);
      if (index === 0) await chip.click({ force: true });
      else await clickThroughDialog(item.id);
      const dialog = page.locator('.skill-detail-dialog');
      assert.equal(await dialog.evaluate(el => el.open), true, `${item.title}: dialog open`);
      assert.equal(await dialog.evaluate(el => el.matches(':modal')), false, `${item.title}: cloud remains clickable behind the shared detail`);
      assert.equal(await dialog.locator('[data-skill-group]').textContent(), `${item.group} / ${item.groupLabel}`);
      assert.equal(await dialog.locator('[data-skill-title]').textContent(), item.title);
      assert.equal(await dialog.locator('[data-skill-body]').evaluate(el => getComputedStyle(el).display), 'none');
      const cards = dialog.getByRole('listitem');
      assert.equal(await cards.count(), item.evidence.length, `${item.title}: evidence count`);
      for (let i = 0; i < item.evidence.length; i++) {
        const card = cards.nth(i);
        assert.equal(await card.locator('.skill-evidence-number').textContent(), String(i + 1).padStart(2, '0'));
        assert.equal(await card.locator('.skill-evidence-title').textContent(), item.evidence[i].title);
        assert.equal(await card.locator('.skill-evidence-text').textContent(), item.evidence[i].text);
        assert.equal(await card.locator('.skill-evidence-highlight').count(), item.evidence[i].highlights.length);
        const cardBounds = await card.boundingBox();
        const dialogBounds = await dialog.boundingBox();
        assert.ok(cardBounds.x >= dialogBounds.x && cardBounds.x + cardBounds.width <= dialogBounds.x + dialogBounds.width + 1, `${item.title}: card fits dialog`);
      }
      await cards.last().scrollIntoViewIfNeeded();
      const lastCardBounds = await cards.last().boundingBox();
      const visibleDialogBounds = await dialog.boundingBox();
      assert.ok(lastCardBounds.y >= visibleDialogBounds.y && lastCardBounds.y + lastCardBounds.height <= visibleDialogBounds.y + visibleDialogBounds.height + 1, `${item.title}: last card is reachable inside the scrollable detail`);
      const layout = await dialog.locator('.skill-evidence-cards').evaluate(el => {
        const cards = Array.from(el.children);
        const firstTop = cards[0].getBoundingClientRect().top;
        return {
          columns: cards.filter(card => Math.abs(card.getBoundingClientRect().top - firstTop) < 1).length,
          width: el.clientWidth,
          scrollWidth: el.scrollWidth,
        };
      });
      assert.equal(layout.columns, viewport.width < 760 ? 1 : item.evidence.length);
      assert.ok(layout.scrollWidth <= layout.width + 1, `${item.title}: no horizontal overflow`);
      if (item.id === 'insight' && viewport.width === 1440) {
        const backdrop = await dialog.evaluate(el => getComputedStyle(el, '::backdrop').backdropFilter);
        assert.match(backdrop, /blur/);
      }
      if (item.id === 'insight' && process.env.SKILLCLOUD_SCREENSHOT_DIR) {
        fs.mkdirSync(process.env.SKILLCLOUD_SCREENSHOT_DIR, { recursive: true });
        await page.screenshot({ path: path.join(process.env.SKILLCLOUD_SCREENSHOT_DIR, `skillcloud-redesign-${viewport.width}.png`) });
      }
      if (viewport.width === 1440) {
        assert.equal(await chip.evaluate(el => el.classList.contains('is-viewed')), true);
      }
      console.log(`${viewport.width}px PASS ${item.group} / ${item.title} (${item.evidence.length})`);
    }
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('.skill-detail-dialog').evaluate(el => el.open), false, `${viewport.width}px: Escape closes the detail`);
  }

  const dialog = page.locator('.skill-detail-dialog');
  await page.locator('[data-skill-id="insight"]').click({ force: true });
  await clickThroughDialog('model-selection');
  assert.equal(await dialog.evaluate(el => el.open), true, 'switching skill keeps the same detail open');
  assert.equal(await dialog.locator('[data-skill-title]').textContent(), '模型选型');
  assert.equal(await dialog.getByRole('listitem').count(), 2);
  await page.keyboard.press('Escape');
  assert.equal(await dialog.evaluate(el => el.open), false, 'Escape closes the detail');
  assert.equal(await page.locator('[data-skill-id="model-selection"]').evaluate(el => el === document.activeElement), true, 'focus returns to the last skill');

  await page.locator('[data-skill-id="insight"]').click({ force: true });
  await page.locator('.skill-detail-close').click({ force: true });
  assert.equal(await dialog.evaluate(el => el.open), false, 'close button closes the detail');
  await page.locator('[data-skill-id="insight"]').click({ force: true });
  await page.mouse.click(8, 8);
  assert.equal(await dialog.evaluate(el => el.open), false, 'clicking outside closes the detail');

  await page.locator('[data-skill-id="insight"]').click({ force: true });
  await page.keyboard.press('Escape');
  await page.locator('[data-skill="象棋"]').click({ force: true });
  assert.equal(await dialog.evaluate(el => el.open), true, 'Energy media still opens through the existing detail surface');
  assert.equal(await dialog.evaluate(el => el.matches(':modal')), true, 'Energy retains its native media modal');
  assert.equal(await dialog.evaluate(el => el.classList.contains('is-media-only')), true);
  assert.equal(await dialog.locator('.skill-evidence-cards').count(), 0, 'Energy keeps its existing media presentation');
  await page.keyboard.press('Escape');

  const stored = JSON.parse(await page.evaluate(() => localStorage.getItem('portfolio.skillCloud.viewed.v1')));
  assert.equal(stored['需求洞察'], true, 'legacy viewed entries remain');
  assert.equal(stored['AI 产品设计'], true, 'renamed skill viewed entry remains');
  assert.equal(stored.insight, true, 'stable ID is stored for future label changes');
  assert.equal(stored['象棋'], true, 'Energy viewed entry remains');
  assert.deepEqual(errors, []);
  await context.close();
} finally {
  await browser.close();
}
console.log('Browser interaction and responsive checks passed.');
