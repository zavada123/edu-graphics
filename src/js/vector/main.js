/**
 * EduProstir, vector mode: the lessons of shapes, nodes, groups and alignment in SVG-Edit (MIT,
 * github.com/SVG-Edit/svgedit), with the same task card, checks and messages as the raster editor.
 *
 * Page parameters are those of index.html: `?lesson=<id>` and `&embed=1` (no lesson picker; `ready` and
 * `checked` go to the parent window).
 *
 * SVG-Edit is not bundled: the build copies its ready editor to svgedit/ (scripts/svgedit.mjs) and this
 * script loads it as a module from there.
 */

import { all_met, run_checks } from '../edu/checks.js';
import { catalog, catalog_lesson, next_of, page_of } from '../edu/catalog.js';
import { mount_panel } from '../edu/panel.js';
import { VECTOR_TOOLS } from './lessons.js';
import { read_drawing } from './snapshot.js';
import { UK_FIXES } from './uk.js';
import '../edu/edu.css';
import './vector.css';

const params = new URLSearchParams(window.location.search);
const embedded = params.get('embed') === '1';
const asked = catalog_lesson(params.get('lesson') ?? '');

/** Buttons and menu items no lesson needs: files, the SVG source, links, the editor's own settings. */
const ALWAYS_HIDDEN = ['main_button', 'tool_source', 'tool_image', 'tool_wireframe', 'tool_make_link', 'tool_make_link_multi',
	'tool_node_link', 'tool_link_url', 'tool_unlink_use', 'tool_docprops', 'tool_editor_prefs', 'tool_editor_homepage', 'tool_export'];

/** Buttons of the left bar that open a row of tools: hidden when no tool of the row is open. */
const FLYOUTS = { tools_rect: ['rect', 'square', 'fhrect'], tools_ellipse: ['ellipse', 'circle', 'fhellipse'] };

/** The ids of the buttons this lesson hides. */
function hidden_ids(lesson) {
	const open = new Set(['select', 'zoom', ...(lesson.manifest.tools ?? [])]);
	const flyouts = Object.entries(FLYOUTS).filter(([, tools]) => !tools.some((t) => open.has(t))).map(([id]) => id);
	return [...ALWAYS_HIDDEN, ...flyouts, ...VECTOR_TOOLS.filter((t) => !open.has(t)).map((t) => 'tool_' + t)];
}

/** Hidden buttons stay hidden and their keys do nothing (SVG-Edit listens for them on the document). */
function guard(editor, ids) {
	const style = document.createElement('style');
	style.textContent = ids.map((id) => `#${id}`).join(',\n') + ' { display: none !important; }';
	document.head.append(style);

	const keys = new Set();
	for (const id of ids) {
		const shortcut = document.getElementById(id)?.getAttribute('shortcut');
		if (!shortcut) continue;
		keys.add(shortcut.toUpperCase());
		keys.add(shortcut.toLowerCase());
	}
	window.addEventListener('keydown', (e) => {
		if (e.target.nodeName !== 'BODY') return;
		const button = `${e.metaKey ? 'meta+' : ''}${e.ctrlKey ? 'ctrl+' : ''}${e.key.toUpperCase()}`;
		const menu = `${e.altKey ? 'alt+' : ''}${e.shiftKey ? 'shift+' : ''}${e.metaKey ? 'meta+' : ''}${e.ctrlKey ? 'ctrl+' : ''}${e.key.toLowerCase()}`;
		if (!keys.has(button) && !keys.has(menu.toUpperCase()) && !keys.has(menu)) return;
		e.preventDefault();
		e.stopImmediatePropagation();
	}, true);
	// Pasted or dropped files would bring pictures from outside the lesson.
	for (const type of ['drop', 'dragover']) {
		window.addEventListener(type, (e) => { e.preventDefault(); e.stopImmediatePropagation(); }, true);
	}
}

/** Corrected Ukrainian texts; the buttons read their titles again. */
function fix_texts(editor) {
	editor.i18next.addResourceBundle('uk', 'translation', UK_FIXES, true, true);
	for (const node of document.querySelectorAll('[title*="."]')) {
		if (!node.tagName.startsWith('SE-')) continue;
		const key = node.getAttribute('title');
		node.setAttribute('title', '');
		node.setAttribute('title', key);
	}
}

/** Ctrl+G and Ctrl+Shift+G group and ungroup, as in other vector editors (SVG-Edit has only G). */
function group_keys(editor) {
	window.addEventListener('keydown', (e) => {
		if (e.target.nodeName !== 'BODY' || !(e.ctrlKey || e.metaKey) || e.code !== 'KeyG') return;
		e.preventDefault();
		e.stopImmediatePropagation();
		const canvas = editor.svgCanvas;
		const selected = canvas.getSelectedElements().filter(Boolean);
		if (e.shiftKey) {
			if (selected.length === 1 && selected[0].tagName.toLowerCase() === 'g') canvas.ungroupSelectedElement();
		} else if (selected.length > 1) {
			canvas.groupSelectedElements();
		}
	}, true);
}

/**
 * After «Вирівняти…» SVG-Edit keeps the shapes selected but shows the panel of one shape, so the next button
 * («Розподілити…») is gone. Selecting the same shapes again brings the panel of several shapes back.
 */
function keep_multi_panel(editor) {
	const canvas = editor.svgCanvas;
	for (const node of document.querySelectorAll('[id^="tool_align_"]')) {
		node.addEventListener('click', () => setTimeout(() => {
			const selected = canvas.getSelectedElements().filter(Boolean);
			if (selected.length < 2) return;
			canvas.clearSelection();
			canvas.addToSelection(selected, true);
		}));
	}
}

function post(lesson, message) {
	if (!embedded || window.parent === window) return;
	window.parent.postMessage({ source: 'edu-graphics', lesson: lesson.id, ...message }, '*');
}

/** Waits for SVG-Edit to finish its start (it calls back at once when it is ready already). */
const ready = (editor) => new Promise((resolve) => editor.ready(resolve));

const canvas_root = () => document.getElementById('svgcontent');

async function start(lesson) {
	const side = document.querySelector('.edu-vector-side');
	const container = document.getElementById('container');
	const { default: Editor } = await import(/* webpackIgnore: true */ new URL('svgedit/Editor.js', document.baseURI).href);
	const editor = new Editor(container);
	editor.setConfig({
		lang: 'uk',
		imgPath: './svgedit/images',
		extPath: './svgedit/extensions',
		noDefaultExtensions: true,
		extensions: [],
		noStorageOnLoad: true,
		forceStorage: false,
		no_save_warning: true,
		showRulers: false,
		dimensions: [lesson.start.width, lesson.start.height],
		initFill: { color: 'f97316', opacity: 1 },
		initStroke: { color: '1f2937', opacity: 1, width: 3 },
	});
	editor.init();
	await ready(editor);
	guard(editor, hidden_ids(lesson));
	fix_texts(editor);
	group_keys(editor);
	keep_multi_panel(editor);

	const canvas = editor.svgCanvas;
	canvas.setSvgString(lesson.start.svg);
	// The starting picture is not the student's work: «Скасувати» does not take it away.
	canvas.undoMgr.resetUndoStack();
	canvas.clearSelection();
	editor.topPanel.updateTitle(lesson.title);
	editor.zoomChanged(window, 'canvas');
	const start_layers = read_drawing(canvas_root(), canvas.getZoom());

	const snapshot = () => ({
		width: lesson.start.width,
		height: lesson.start.height,
		layers: read_drawing(canvas_root(), canvas.getZoom()),
		start: { layers: start_layers },
		journal: [],
		image: null,
		zoom: { now: canvas.getZoom(), max: canvas.getZoom() },
		answers: panel.answers(),
	});
	const panel = mount_panel(side, {
		lesson,
		lessons: catalog,
		embedded,
		next: next_of(lesson),
		on_check: async () => {
			const results = run_checks(lesson.checks, snapshot());
			post(lesson, { type: 'checked', solved: all_met(results), results: results.map((r) => ({ ok: r.ok, text: r.text })) });
			return results;
		},
		on_reset: () => window.location.reload(),
		on_pick: (id) => {
			params.set('lesson', id);
			window.location.assign(page_of(catalog_lesson(id) ?? lesson) + '?' + params.toString());
		},
	});
	window.EduGraphics = { lesson, snapshot, check: async () => run_checks(lesson.checks, snapshot()), panel, editor };
	post(lesson, { type: 'ready' });
}

if (asked === undefined || page_of(asked) !== 'vector.html') {
	// Not a lesson of this editor: the raster editor runs the rest, free drawing too.
	window.location.replace('index.html' + window.location.search);
} else {
	document.title = `${asked.title} · Графічний редактор`;
	window.addEventListener('DOMContentLoaded', () => { start(asked); });
}
