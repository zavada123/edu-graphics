// EduProstir trainer logic: run with `npm test` (Node's own test runner, no browser needed).
import { test } from 'node:test';
import assert from 'node:assert/strict';

import { color_family } from '../src/js/edu/colors.js';
import { all_met, count_pixels, evenly_spaced, layer_matches, run_checks } from '../src/js/edu/checks.js';
import { parse_shortcut, resolve_key } from '../src/js/edu/keymap.js';
import { lessons } from '../src/js/edu/lessons.js';
import menu, { menu_commands } from '../src/js/edu/menu.js';
import { Policy, SHAPES, STATES, TOOLS } from '../src/js/edu/policy.js';
import { build_document } from '../src/js/edu/scene.js';
import { paint_of, plain_layers } from '../src/js/edu/snapshot.js';

// ── Colours ─────────────────────────────────────────────────────────

test('colour families of common picker colours', () => {
	const cases = {
		'#ef4444': 'red', '#ff0000': 'red', '#f97316': 'orange', '#facc15': 'yellow', '#ffff00': 'yellow',
		'#22c55e': 'green', '#008000': 'green', '#38bdf8': 'blue', '#2563eb': 'blue', '#8b5cf6': 'purple',
		'#ec4899': 'pink', '#92400e': 'brown', '#000000': 'black', '#1f2937': 'black', '#ffffff': 'white',
		'#9ca3af': 'gray', '#aaaaaa': 'gray', 'rgb(250, 204, 21)': 'yellow', '#f00': 'red',
	};
	for (const [color, family] of Object.entries(cases)) assert.equal(color_family(color), family, color);
	assert.equal(color_family('not a colour'), null);
});

// ── Snapshot ────────────────────────────────────────────────────────

const shape = (over) => ({
	id: 2, name: 'Еліпс', type: 'ellipse', x: 10, y: 20, width: 100, height: 50, order: 2, visible: true,
	params: { fill: true, fill_color: '#22c55e', border: true, border_color: '#ef4444', border_size: 5 }, color: null, data: null, ...over,
});

test('paint of shapes, text and strokes', () => {
	assert.deepEqual(paint_of(shape()), { fill: '#22c55e', stroke: '#ef4444', stroke_size: 5 });
	assert.deepEqual(paint_of(shape({ params: { fill: false, fill_color: '#22c55e', border: true, border_color: '#ef4444', border_size: 0 } })),
		{ fill: null, stroke: null, stroke_size: 0 });
	const text = { type: 'text', data: [[{ text: 'Hi', meta: { fill_color: '#ffffff00', stroke_size: 2, stroke_color: '#ef4444' } }]] };
	assert.deepEqual(paint_of(text), { fill: null, stroke: '#ef4444', stroke_size: 2 });
	assert.deepEqual(paint_of({ type: 'text', data: [[{ text: 'Hi', meta: {} }]] }), { fill: '#008800', stroke: null, stroke_size: 0 });
	assert.deepEqual(paint_of({ type: 'brush', color: '#008000', params: { size: 12 } }), { fill: null, stroke: '#008000', stroke_size: 12 });
});

test('plain layers are ordered bottom to top and skip empty layers', () => {
	const layers = plain_layers([
		shape({ id: 3, order: 9, name: 'Top' }),
		{ id: 1, order: 1, type: null, name: 'Empty' },
		shape({ id: 2, order: 4, name: 'Bottom' }),
		{ id: 4, order: 5, type: 'text', name: 'T', x: 0, y: 0, width: 50, height: 20, data: [[{ text: 'Ярмарок ', meta: {} }, { text: 'добра', meta: {} }]] },
	]);
	assert.deepEqual(layers.map((l) => [l.name, l.index]), [['Bottom', 0], ['T', 1], ['Top', 2]]);
	assert.equal(layers[1].text, 'Ярмарок добра');
});

// ── Checks ──────────────────────────────────────────────────────────

const snap = (layers, extra = {}) => ({ width: 800, height: 500, layers: plain_layers(layers), start: { layers: [] }, journal: [], image: null, ...extra });

test('layer match by type, colour families, stroke and text', () => {
	const [l] = plain_layers([shape()]);
	assert.ok(layer_matches(l, { type: 'ellipse', fill: 'green', stroke: 'red', min_stroke: 4 }));
	assert.ok(layer_matches(l, { type: ['rectangle', 'ellipse'] }));
	assert.ok(!layer_matches(l, { fill: 'red' }));
	assert.ok(!layer_matches(l, { min_stroke: 6 }));
	assert.ok(!layer_matches(l, { fill: 'none' }));
	assert.ok(!layer_matches(l, { min_size: 60 }));
	const [hidden] = plain_layers([shape({ visible: false })]);
	assert.ok(!layer_matches(hidden, {}));
});

test('recolored needs the same layer with a new colour', () => {
	const star = { id: 2, name: 'Зірка', type: 'star', x: 0, y: 0, width: 100, height: 100, order: 2, params: { fill: true, fill_color: '#facc15', border: false, border_size: 0, corners: 5 } };
	const start = { layers: plain_layers([star]) };
	const check = { type: 'recolored', name: 'Зірка', match: { fill: 'red' }, text: '', hint: '' };
	const recolored = { ...star, params: { ...star.params, fill_color: '#ef4444' } };
	assert.equal(run_checks([check], snap([recolored], { start }))[0].ok, true);
	// A new red star with another id does not count.
	assert.equal(run_checks([check], snap([{ ...recolored, id: 7 }], { start }))[0].ok, false);
	assert.equal(run_checks([check], snap([star], { start }))[0].ok, false);
});

test('in front, above, inside and layer count', () => {
	const sun = shape({ id: 3, name: 'Сонце', order: 3, x: 600, y: 20, width: 100, height: 100 });
	const hill = shape({ id: 2, name: 'Гора', order: 2, x: 100, y: 200, width: 400, height: 300 });
	const s = snap([sun, hill]);
	const results = run_checks([
		{ type: 'in_front', match: { name: 'Сонце' }, behind: { name: 'Гора' } },
		{ type: 'in_front', match: { name: 'Гора' }, behind: { name: 'Сонце' } },
		{ type: 'above', match: { name: 'Сонце' }, over: { name: 'Гора' } },
		{ type: 'inside', match: { name: 'Сонце' }, area: { x: 560, y: 0, w: 240, h: 170 } },
		{ type: 'layers', match: { type: 'ellipse' }, min: 1, max: 1 },
		{ type: 'layers', match: { type: 'ellipse' }, min: 2 },
	], s);
	assert.deepEqual(results.map((r) => r.ok), [true, false, true, true, false, true]);
});

test('aligned and evenly spaced rows', () => {
	const row = (xs, ys) => xs.map((x, i) => shape({ id: i + 1, order: i + 1, type: 'star', x, y: ys[i], width: 70, height: 70 }));
	const good = snap(row([100, 220, 340, 460, 580], [300, 300, 301, 300, 299]));
	const checks = [
		{ type: 'aligned', match: { type: 'star' }, edge: 'top', min: 5, tolerance: 2 },
		{ type: 'spaced', match: { type: 'star' }, axis: 'x', min: 5, tolerance: 2 },
	];
	assert.ok(all_met(run_checks(checks, good)));
	const bad = snap(row([90, 230, 320, 470, 610], [210, 250, 190, 280, 230]));
	assert.deepEqual(run_checks(checks, bad).map((r) => r.ok), [false, false]);
	// Overlapping shapes are not a row.
	assert.equal(evenly_spaced([{ x: 0, y: 0, w: 100, h: 10 }, { x: 20, y: 0, w: 100, h: 10 }, { x: 40, y: 0, w: 100, h: 10 }], 'x', 1), false);
});

/** A fake RGBA picture: `paint(x, y)` returns [r, g, b, a]. */
const image = (w, h, paint) => {
	const data = new Uint8ClampedArray(w * h * 4);
	for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) data.set(paint(x, y), (y * w + x) * 4);
	return { width: w, height: h, data };
};

test('pixel share and the centre of a colour spot', () => {
	// Blue sky, a yellow 40×40 sun in the top-right corner.
	const img = image(200, 100, (x, y) => (x >= 150 && x < 190 && y >= 10 && y < 50 ? [250, 204, 21, 255] : [56, 189, 248, 255]));
	const s = { ...snap([]), width: 200, height: 100, image: img };
	const results = run_checks([
		{ type: 'pixels', family: 'blue', min_share: 0.85 },
		{ type: 'pixels', family: 'yellow', area: { x: 150, y: 10, w: 40, h: 40 }, min_share: 0.95 },
		{ type: 'pixels_center', family: 'yellow', area: { x: 140, y: 0, w: 60, h: 60 } },
		{ type: 'pixels_center', family: 'yellow', area: { x: 0, y: 0, w: 60, h: 60 } },
	], s);
	assert.deepEqual(results.map((r) => r.ok), [true, true, true, false]);
	const transparent = image(10, 10, () => [255, 255, 0, 0]);
	assert.equal(count_pixels(transparent, 'yellow', { x: 0, y: 0, w: 10, h: 10 }).hits, 0);
	assert.equal(run_checks([{ type: 'pixels', family: 'blue', min_share: 0.1 }], snap([]))[0].ok, false, 'no picture, no pass');
});

test('canvas size, tools used and the last saved format', () => {
	const journal = [{ kind: 'tool', name: 'brush' }, { kind: 'save', format: 'JSON' }, { kind: 'save', format: 'PNG' }];
	const s = snap([], { journal });
	const results = run_checks([
		{ type: 'canvas', width: 800, height: 500 },
		{ type: 'canvas', width: 800, height: 600 },
		{ type: 'used', kind: 'tool', name: 'brush' },
		{ type: 'used', kind: 'tool', name: 'fill' },
		{ type: 'saved', formats: ['PNG', 'JPG'] },
		{ type: 'saved', formats: ['JSON'] },
	], s);
	assert.deepEqual(results.map((r) => r.ok), [true, false, true, false, true, false]);
	assert.equal(all_met([]), false, 'a task without conditions is never "solved"');
});

// ── Policy ──────────────────────────────────────────────────────────

test('tools are on, grey or hidden', () => {
	const p = new Policy({ tools: ['select', 'shape'], shapes: ['ellipse'], hidden: ['crop'] });
	assert.equal(p.tool_state('select'), STATES.on);
	assert.equal(p.tool_state('brush'), STATES.later);
	assert.equal(p.tool_state('crop'), STATES.hidden);
	assert.equal(p.tool_state('media'), STATES.hidden, 'internet search is never shown');
	assert.equal(p.tool_state('ellipse'), STATES.on);
	assert.equal(p.tool_state('star'), STATES.hidden);
	assert.equal(new Policy({ tools: ['select'], shapes: ['ellipse'] }).tool_state('ellipse'), STATES.hidden, 'a shape needs the shape tool');
	assert.equal(p.tool_state('no_such_tool'), STATES.hidden);
});

test('commands: lesson list, prefixes, always-on and always-hidden', () => {
	const p = new Policy({ tools: ['brush'], commands: ['layer/*', 'file/save.export'], hidden: ['effects/*'] });
	assert.ok(p.can_run('layer/duplicate.duplicate'));
	assert.ok(p.can_run('file/save.export'));
	assert.ok(!p.can_run('file/save.save'));
	assert.equal(p.command_state('file/save.save'), STATES.later);
	assert.equal(p.command_state('effects/common/blur.blur'), STATES.hidden);
	assert.ok(p.can_run('edit/undo.undo') && p.can_run('view/zoom.in') && p.can_run('help/shortcuts.shortcuts'));
	assert.equal(p.command_state('file/open.open_url'), STATES.hidden);
	assert.equal(p.command_state('edu/commands.free_transform'), STATES.later, 'free transform follows the move tool');
	const free = new Policy({ all: true });
	assert.ok(free.can_run('effects/common/blur.blur') && free.can_use_tool('clone') && free.can_use_tool('star'));
	assert.equal(free.tool_state('media'), STATES.hidden);
});

test('the menu of a lesson drops hidden items and keeps grey ones', () => {
	const p = new Policy({ tools: ['select'], commands: ['layer/move.*'], hidden: ['effects/*', 'image/*'] });
	const filtered = p.filter_menu(menu);
	const names = filtered.map((m) => m.name);
	assert.ok(!names.includes('Фільтр'), 'a menu with only hidden items disappears');
	assert.ok(!names.includes('Зображення'));
	const layer = filtered.find((m) => m.name === 'Шар');
	const order = layer.children.find((m) => m.name === 'Упорядкувати');
	assert.ok(order.children.every((c) => !c.edu_later));
	assert.ok(layer.children.find((m) => m.name === 'Дублювати шар').edu_later);
	for (const group of filtered) {
		const kids = group.children;
		assert.ok(!kids[0].divider && !kids[kids.length - 1].divider, 'no divider at an edge: ' + group.name);
		kids.forEach((k, i) => assert.ok(!(k.divider && kids[i - 1] && kids[i - 1].divider), 'no double divider'));
	}
});

// ── Keyboard ────────────────────────────────────────────────────────

const key = (code, mods = {}) => ({ code, ctrl: false, shift: false, alt: false, ...mods });
const ctx = (open, current = 'select') => ({ current_tool: current, can_use_tool: (n) => open.includes(n) });

test('shortcuts parse into physical keys', () => {
	assert.deepEqual(parse_shortcut('Ctrl+Shift+N'), { ctrl: true, shift: true, alt: false, codes: ['KeyN'] });
	assert.deepEqual(parse_shortcut('Ctrl+=').codes, ['Equal', 'NumpadAdd']);
	assert.deepEqual(parse_shortcut('Ctrl+[').codes, ['BracketLeft']);
	assert.deepEqual(parse_shortcut('F1').codes, ['F1']);
	assert.throws(() => parse_shortcut('Ctrl+?'));
	for (const c of menu_commands()) if (c.shortcut) parse_shortcut(c.shortcut);
});

test('tool keys of a typical photo editor, with Shift cycling', () => {
	const open = ['select', 'brush', 'pencil', 'fill', 'gradient', 'text'];
	assert.deepEqual(resolve_key(key('KeyV'), ctx(open)), { type: 'tool', name: 'select' });
	assert.deepEqual(resolve_key(key('KeyB'), ctx(open)), { type: 'tool', name: 'brush' });
	assert.deepEqual(resolve_key(key('KeyB', { shift: true }), ctx(open, 'brush')), { type: 'tool', name: 'pencil' });
	assert.deepEqual(resolve_key(key('KeyB', { shift: true }), ctx(open, 'pencil')), { type: 'tool', name: 'brush' });
	assert.deepEqual(resolve_key(key('KeyB'), ctx(open, 'pencil')), { type: 'tool', name: 'pencil' }, 'B keeps the tool of the group');
	assert.deepEqual(resolve_key(key('KeyG'), ctx(['gradient'])), { type: 'tool', name: 'gradient' });
	assert.deepEqual(resolve_key(key('KeyC'), ctx(open)), { type: 'tool', name: 'crop' }, 'a closed tool still resolves, the policy refuses it');
	assert.deepEqual(resolve_key(key('KeyT'), ctx(open)), { type: 'tool', name: 'text' });
});

test('menu shortcuts, native keys, passes and blocks', () => {
	const c = ctx([]);
	assert.deepEqual(resolve_key(key('KeyJ', { ctrl: true }), c), { type: 'command', target: 'layer/duplicate.duplicate', native: false });
	assert.deepEqual(resolve_key(key('KeyZ', { ctrl: true }), c), { type: 'command', target: 'edit/undo.undo', native: false });
	assert.deepEqual(resolve_key(key('KeyZ', { ctrl: true, shift: true }), c), { type: 'command', target: 'edit/redo.redo', native: false });
	assert.deepEqual(resolve_key(key('KeyY', { ctrl: true }), c), { type: 'command', target: 'edit/redo.redo', native: false });
	assert.deepEqual(resolve_key(key('KeyV', { ctrl: true }), c), { type: 'command', target: 'edit/paste.paste', native: true });
	assert.deepEqual(resolve_key(key('NumpadAdd', { ctrl: true }), c), { type: 'command', target: 'view/zoom.in', native: false });
	assert.deepEqual(resolve_key(key('BracketRight'), c), { type: 'brush_size', delta: 1 });
	assert.deepEqual(resolve_key(key('BracketRight', { ctrl: true }), c), { type: 'command', target: 'layer/move.up', native: false });
	for (const code of ['Escape', 'Delete', 'ArrowLeft', 'Enter', 'Space']) assert.deepEqual(resolve_key(key(code), c), { type: 'pass' }, code);
	// Keys of the original editor and of the browser do nothing.
	for (const k of [key('KeyF'), key('KeyD'), key('KeyN'), key('F3'), key('F5'), key('F12'), key('KeyU', { ctrl: true, shift: true, alt: true })])
		assert.deepEqual(resolve_key(k, c), { type: 'block' }, k.code);
});

// ── Lessons ─────────────────────────────────────────────────────────

const CHECK_TYPES = ['layers', 'recolored', 'in_front', 'above', 'inside', 'aligned', 'spaced', 'canvas', 'pixels', 'pixels_center', 'used', 'saved'];

test('every lesson is complete and consistent', () => {
	const ids = new Set();
	for (const l of lessons) {
		assert.ok(!ids.has(l.id), 'unique id ' + l.id);
		ids.add(l.id);
		assert.ok(l.title && l.task.length > 0, l.id);
		const p = new Policy(l.manifest);
		for (const t of l.manifest.tools ?? []) assert.ok(TOOLS[t], `${l.id}: unknown tool ${t}`);
		for (const s of l.manifest.shapes ?? []) assert.ok(SHAPES[s], `${l.id}: unknown shape ${s}`);
		for (const c of l.manifest.commands ?? []) assert.ok(menu_commands().some((m) => m.target.startsWith(c.replace(/\*$/, ''))), `${l.id}: no menu command ${c}`);
		if (!l.free) assert.ok(l.checks.length > 0, l.id);
		for (const c of l.checks) {
			assert.ok(CHECK_TYPES.includes(c.type), `${l.id}: ${c.type}`);
			assert.ok(c.text && c.hint, `${l.id}: text and hint`);
			if (c.type === 'used' && c.kind === 'tool') assert.ok(p.can_use_tool(c.name), `${l.id}: the tool ${c.name} must be open`);
		}
		const doc = build_document(l.start, () => 'data:image/png;base64,');
		assert.equal(doc.layers.length, l.start.layers.length);
		assert.equal(doc.info.width, l.start.width);
	}
});

test('no lesson is solved at the start', () => {
	for (const l of lessons.filter((x) => !x.free)) {
		const doc = build_document(l.start, () => '');
		const layers = plain_layers(doc.layers);
		// The picture of the start is unknown here; pixel checks fail without it, which is the point:
		// the layer and journal checks must fail on the start too.
		const s = { width: doc.info.width, height: doc.info.height, layers, start: { layers }, journal: [], image: null };
		assert.equal(all_met(run_checks(l.checks, s)), false, l.id);
	}
});

test('a reference solution passes the layer checks of each vector lesson', () => {
	const by = (id) => lessons.find((l) => l.id === id);
	const solve = (id, change) => {
		const l = by(id);
		const doc = build_document(l.start, () => '');
		const start = plain_layers(doc.layers);
		const layers = change(structuredClone(doc.layers));
		return run_checks(l.checks, { width: doc.info.width, height: doc.info.height, layers: plain_layers(layers), start: { layers: start }, journal: [], image: null });
	};
	const ellipse = { id: 9, order: 9, type: 'ellipse', name: 'Ellipse #9', x: 300, y: 300, width: 200, height: 80, params: { fill: true, fill_color: '#22c55e', border: true, border_color: '#ef4444', border_size: 6 } };
	assert.ok(all_met(solve('inf6-09-flowerbed', (ls) => [...ls, ellipse])));

	const star = { id: 9, order: 9, type: 'star', name: 'Star #9', x: 300, y: 100, width: 200, height: 200, params: { fill: true, fill_color: '#ffd400', border: true, border_color: '#f97316', border_size: 4, corners: 5 } };
	assert.ok(all_met(solve('inf6-10-star', (ls) => [...ls, star])));

	assert.ok(all_met(solve('inf6-10-recolor', (ls) => ls.map((x) => (x.name === 'Зірка' ? { ...x, params: { ...x.params, fill_color: '#dc2626' } } : x)))));

	assert.ok(all_met(solve('inf6-11-sun-behind', (ls) => ls.map((x) => (x.name === 'Сонце' ? { ...x, order: 2 } : x.name === 'Гора' ? { ...x, order: 3 } : x)))));

	const xs = [100, 220, 340, 460, 580];
	assert.ok(all_met(solve('inf6-11-flowers-row', (ls) => ls.map((x) => (x.type === 'star' ? { ...x, x: xs[Number(x.name.slice(-1)) - 1], y: 250 } : x)))));

	const title = { id: 9, order: 9, type: 'text', name: 'Text #9', x: 200, y: 120, width: 420, height: 60, params: {}, data: [[{ text: 'ярмарок  добра ', meta: { stroke_size: 2, stroke_color: '#1f2937' } }]] };
	assert.ok(all_met(solve('inf6-11-title', (ls) => [...ls, title])));
});
