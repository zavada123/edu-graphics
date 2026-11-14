// End-to-end run of every lesson in a real browser: `npm run build && npm run e2e`.
// Needs Playwright with Chromium (`npm i --no-save playwright && npx playwright install chromium`).
// Each lesson: the start is not solved, the student's steps are done with the mouse and keys, the check passes.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const types = { '.html': 'text/html', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.json': 'application/json', '.css': 'text/css' };
const server = http.createServer((req, res) => {
	const file = path.join(root, decodeURIComponent(new URL(req.url, 'http://x').pathname));
	if (!file.startsWith(root) || !fs.existsSync(file)) return res.writeHead(404).end();
	const target = fs.statSync(file).isDirectory() ? path.join(file, 'index.html') : file;
	res.writeHead(200, { 'content-type': types[path.extname(target)] ?? 'application/octet-stream' });
	fs.createReadStream(target).pipe(res);
});
await new Promise((r) => server.listen(0, r));
const base = `http://localhost:${server.address().port}/`;

const browser = await chromium.launch();
const context = await browser.newContext({ viewport: { width: 1440, height: 900 }, acceptDownloads: true });
const page = await context.newPage();
const errors = [];
page.on('pageerror', (e) => errors.push(e.message));

const open = async (id) => {
	await page.goto(`${base}?lesson=${id}`);
	await page.waitForFunction(() => window.EduGraphics !== undefined);
	await page.waitForTimeout(300);
};
const results = () => page.evaluate(async () => (await window.EduGraphics.check()).map((r) => r.ok));
const solved = async () => (await results()).every(Boolean);
/** Canvas point (in picture pixels) → screen point. */
const at = async (x, y) => {
	const box = await page.locator('#canvas_minipaint').boundingBox();
	const zoom = await page.evaluate(() => window.AppConfig.ZOOM);
	return [box.x + x * zoom, box.y + y * zoom];
};
const drag = async (from, to) => {
	await page.mouse.move(...from);
	await page.mouse.down();
	await page.mouse.move(...to, { steps: 12 });
	await page.mouse.up();
	await page.waitForTimeout(200);
};
const tool = () => page.evaluate(() => window.AppConfig.TOOL.name);
/** Sets options of the active tool, as the student does in the options bar. */
const options = (values) => page.evaluate((v) => Object.assign(window.AppConfig.TOOL.attributes, v), values);
/** Changes the active layer the way the «Властивості шару» panel does. */
const layer_params = (values) => page.evaluate((v) => window.State.do_action(new (window.EduGraphics.actions.Update_layer_action)(window.AppConfig.layer.id, v)), values);
const pick_shape = async (key) => {
	await page.keyboard.press('u');
	await page.click(`canvas[data-key="${key}"]`);
	await page.waitForTimeout(200);
};
const lessons = {};
const lesson = (id, fn) => { lessons[id] = fn; };

lesson('inf6-09-new-poster', async () => {
	await page.keyboard.press('Control+n');
	await page.fill('#pop_data_width', '800');
	await page.fill('#pop_data_height', '600');
	await page.click('[data-id="popup_ok"]');
	await page.waitForTimeout(300);
	assert.equal(await tool(), 'fill');
	await page.evaluate(() => { window.AppConfig.COLOR = '#facc15'; });
	await page.mouse.click(...(await at(400, 300)));
});

lesson('inf6-09-house-fill', async () => {
	assert.equal(await tool(), 'fill');
	await page.evaluate(() => { window.AppConfig.COLOR = '#facc15'; });
	await page.mouse.click(...(await at(415, 270)));
	await page.evaluate(() => { window.AppConfig.COLOR = '#ef4444'; });
	await page.mouse.click(...(await at(400, 180)));
});

lesson('inf6-09-grass-brush', async () => {
	assert.equal(await tool(), 'brush');
	await page.evaluate(() => { window.AppConfig.COLOR = '#16a34a'; });
	for (let i = 0; i < 8; i++) await page.keyboard.press(']');
	for (let y = 405; y < 500; y += 10) await drag(await at(0, y), await at(800, y));
});

lesson('inf6-09-flowerbed', async () => {
	await pick_shape('ellipse');
	await options({ border_color: '#dc2626', fill_color: '#16a34a', border_size: 6 });
	await drag(await at(250, 380), await at(550, 470));
});

lesson('inf6-09-sun-corner', async () => {
	await drag(await at(115, 385), await at(690, 90));
});

lesson('inf6-09-export-web', async () => {
	await page.click('#main_menu_0_0');
	await page.click('text=Експортувати як зображення');
	const download = page.waitForEvent('download');
	await page.click('[data-id="popup_ok"]');
	assert.match((await download).suggestedFilename(), /^afisha\.png$/);
});

lesson('inf6-10-star', async () => {
	await pick_shape('star');
	await options({ fill_color: '#facc15', border_color: '#f97316', corners: 5 });
	await drag(await at(300, 100), await at(500, 300));
});

lesson('inf6-10-recolor', async () => {
	await page.mouse.click(...(await at(410, 240)));
	assert.equal(await page.evaluate(() => window.AppConfig.layer.name), 'Зірка');
	const params = await page.evaluate(() => ({ ...window.AppConfig.layer.params, fill_color: '#dc2626' }));
	await layer_params({ params });
});

lesson('inf6-11-sun-behind', async () => {
	await page.mouse.click(...(await at(560, 140)));
	assert.equal(await page.evaluate(() => window.AppConfig.layer.name), 'Сонце');
	await page.keyboard.press('Control+BracketLeft');
});

lesson('inf6-11-flowers-row', async () => {
	const xs = [100, 220, 340, 460, 580];
	for (let i = 0; i < 5; i++) {
		await page.evaluate((name) => { window.AppConfig.layer = window.AppConfig.layers.find((l) => l.name === name); }, `Квітка ${i + 1}`);
		await layer_params({ x: xs[i], y: 250 });
	}
});

lesson('inf6-11-title', async () => {
	await page.keyboard.press('t');
	await options({ stroke: '#1f2937', stroke_size: 2, size: 48 });
	await page.mouse.click(...(await at(220, 120)));
	await page.keyboard.type('Ярмарок добра');
	await page.keyboard.press('Escape');
	await page.waitForTimeout(200);
});

// ── Run ─────────────────────────────────────────────────────────────
let failed = 0;
for (const [id, steps] of Object.entries(lessons)) {
	try {
		await open(id);
		assert.equal(await solved(), false, 'the start must not be solved');
		await steps();
		await page.waitForTimeout(300);
		const r = await results();
		assert.ok(r.every(Boolean), 'checks: ' + JSON.stringify(r));
		console.log('ok  ', id);
	} catch (e) {
		failed++;
		console.log('FAIL', id, e.message.split('\n')[0]);
		await page.screenshot({ path: path.join(root, `test/e2e-${id}.png`) });
	}
}

// Closed tools, menu items and keys do nothing.
try {
	await open('inf6-09-flowerbed');
	await page.mouse.click(...(await at(400, 50)));
	await page.keyboard.press('b');
	assert.equal(await tool(), 'select', 'B does not open a closed brush');
	await page.click('#tools_container #brush');
	assert.equal(await tool(), 'select', 'a grey tool does not open');
	assert.ok(await page.evaluate(() => document.querySelector('#tools_container #brush').classList.contains('edu-later')));
	assert.equal(await page.locator('#tools_container #media').count(), 0, 'internet search is not shown');
	const layers = await page.evaluate(() => window.AppConfig.layers.length);
	await page.keyboard.press('Control+j');
	await page.keyboard.press('n');
	assert.equal(await page.evaluate(() => window.AppConfig.layers.length), layers, 'closed Ctrl+J and the old N key add no layer');
	const menus = await page.evaluate(() => [...document.querySelectorAll('#main_menu [role=menubar] > li')].map((li) => li.innerText.trim()));
	assert.ok(!menus.includes('Фільтр'), 'a hidden menu is not shown: ' + menus);
	await page.click('#main_menu_0_3');
	await page.click('text=Дублювати шар');
	assert.equal(await page.evaluate(() => window.AppConfig.layers.length), layers, 'a grey menu item does nothing');
	await page.keyboard.press('u');
	const shapes = await page.evaluate(() => [...document.querySelectorAll('.preview-item-title')].map((n) => n.innerText).sort());
	assert.deepEqual(shapes, ['Еліпс', 'Прямокутник']);
	console.log('ok   closed tools, menu and keys');
} catch (e) {
	failed++;
	console.log('FAIL closed tools', e.message.split('\n')[0]);
}

if (errors.length > 0) console.log('page errors:', errors);
await browser.close();
server.close();
process.exit(failed > 0 || errors.length > 0 ? 1 : 0);
