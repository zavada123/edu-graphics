/**
 * EduProstir: turns the editor into a trainer.
 *
 * `prepare()` runs before the editor builds its interface: it reads the lesson, closes tools and menu
 * commands, and sets the Ukrainian language. `start()` runs after: it loads the starting picture, keeps a
 * journal of what the student does, owns the keyboard and shows the task card.
 *
 * Page parameters: `?lesson=<id>` picks a lesson (lessons.js), `&embed=1` hides the lesson picker and sends
 * the results to the page around the trainer (window.postMessage, see README).
 */

import app from './../app.js';
import config from './../config.js';
import Helper_class from './../libs/helpers.js';
import menu from './menu.js';
import { all_met, run_checks } from './checks.js';
import { can_run, can_use_tool, get_policy, notify_command, notify_tool, set_file_name, set_policy } from './guard.js';
import { resolve_key } from './keymap.js';
import { lesson_by_id, lessons } from './lessons.js';
import { mount_panel } from './panel.js';
import { Policy, STATES, TOOLS, LATER_HINT } from './policy.js';
import { build_document, paint_on_canvas } from './scene.js';
import { plain_layers } from './snapshot.js';
import './edu.css';

const Helper = new Helper_class();
const params = new URLSearchParams(window.location.search);
const embedded = params.get('embed') === '1';
const lesson = lesson_by_id(params.get('lesson') ?? '') ?? lesson_by_id('free');

/** What the student did: tools used for drawing, files saved. Read by the checks. */
const journal = [];
let start_layers = [];

/** Runs before the editor builds its interface. */
export function prepare() {
	const policy = new Policy(lesson.manifest);
	set_policy(policy);
	set_file_name(lesson.file ?? (lesson.free ? 'малюнок' : lesson.title));

	// Ukrainian interface, and no tool remembered from another lesson.
	config.LANG = 'uk';
	Helper.setCookie('language', 'uk');
	Helper.setCookie('theme', 'dark');
	// The trainer reloads the page to start again or to open another lesson: no "leave the page?" question.
	Helper.setCookie('exit_confirm', 0);
	// The task card needs room: the navigator and the information panel start folded (the student can open them).
	for (const panel of ['toggle_preview', 'toggle_info']) {
		if (Helper.getCookie(panel) == null) Helper.setCookie(panel, 0);
	}
	// The lesson starts with its first tool; free drawing starts with the move tool.
	const bar = config.TOOLS.filter((t) => t.visible !== false && policy.can_use_tool(t.name));
	const first_tool = bar.find((t) => t.name === (lesson.manifest.tools ?? [])[0]) ?? bar.find((t) => t.name === 'select') ?? bar[0];
	Helper.setCookie('active_tool', first_tool ? first_tool.name : 'select');

	// Tool bar: hidden tools are removed, the rest get the names and keys of the trainer.
	config.TOOLS = config.TOOLS.filter((t) => policy.tool_state(t.name) !== STATES.hidden || t.visible === false);
	for (const tool of config.TOOLS) {
		const info = TOOLS[tool.name];
		if (info === undefined) continue;
		tool.title = info.key ? `${info.label} (${info.key})` : info.label;
		tool.edu_state = policy.tool_state(tool.name);
	}
	// The menu of this lesson (the array is shared with core/gui/gui-menu.js).
	const filtered = policy.filter_menu(menu);
	menu.splice(0, menu.length, ...filtered);

	document.title = lesson.free ? 'Графічний редактор' : `${lesson.title} · Графічний редактор`;
}

/** Runs after the editor has built its interface and its first empty document. */
export async function start() {
	mark_tool_bar();
	register_commands();
	keep_journal();
	own_keyboard();
	guard_files();
	await load_start();

	const index = lessons.indexOf(lesson);
	const next = lessons[index + 1];
	const panel = mount_panel(document.querySelector('.sidebar_right'), {
		lesson,
		lessons,
		embedded,
		next: next && !next.free ? next : undefined,
		on_check: async () => {
			const results = run_checks(lesson.checks, await snapshot());
			post({ type: 'checked', solved: all_met(results), results: results.map((r) => ({ ok: r.ok, text: r.text })) });
			return results;
		},
		on_reset: () => window.location.reload(),
		on_pick: (id) => {
			params.set('lesson', id);
			window.location.search = params.toString();
		},
	});
	window.EduGraphics = { lesson, journal, snapshot, check: async () => run_checks(lesson.checks, await snapshot()), panel, actions: app.Actions };
	post({ type: 'ready' });
}

function post(message) {
	if (!embedded || window.parent === window) return;
	window.parent.postMessage({ source: 'edu-graphics', lesson: lesson.id, ...message }, '*');
}

/** Grey tools: visible, but a click explains that the tool comes later. */
function mark_tool_bar() {
	for (const tool of config.TOOLS) {
		if (tool.edu_state !== STATES.later) continue;
		const node = document.querySelector('#tools_container #' + tool.name);
		if (!node) continue;
		node.classList.add('edu-later');
		node.setAttribute('aria-disabled', 'true');
		node.title = `${node.title}. ${LATER_HINT}`;
	}
}

/** Commands of the trainer's own menu items. */
function register_commands() {
	app.GUI.modules['edu/commands'] = {
		deselect() {
			const selection = app.GUI.GUI_tools.tools_modules.selection;
			if (!selection) return;
			app.State.do_action(new app.Actions.Bundle_action('clear_selection', 'Clear Selection', selection.object.on_leave()));
		},
		free_transform() {
			app.GUI.GUI_tools.activate_tool('select');
		},
	};
}

function keep_journal() {
	const state = app.State;
	const do_action = state.do_action.bind(state);
	state.do_action = async (action, options) => {
		const result = await do_action(action, options);
		if (result && result.status === 'completed' && action.action_id !== 'activate_tool' && config.TOOL) {
			const last = journal[journal.length - 1];
			if (!last || last.kind !== 'tool' || last.name !== config.TOOL.name) journal.push({ kind: 'tool', name: config.TOOL.name });
		}
		return result;
	};

	// Every save goes through save_action; its `type` is like "PNG - Portable Network Graphics".
	const save = app.GUI.modules['file/save'];
	const proto = Object.getPrototypeOf(save);
	const save_action = proto.save_action;
	proto.save_action = function (response, ...rest) {
		const format = String(response && response.type ? response.type : '').split(/[\s-]/)[0].toUpperCase();
		journal.push({ kind: 'save', format });
		return save_action.call(this, response, ...rest);
	};
}

const is_typing = (target) => Helper.is_input(target) || (target && (target.isContentEditable || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT'));

/** The trainer owns the keyboard (see keymap.js). */
function own_keyboard() {
	window.addEventListener('keydown', (event) => {
		if (is_typing(event.target)) return;
		const key = { code: event.code, ctrl: event.ctrlKey || event.metaKey, shift: event.shiftKey, alt: event.altKey };
		const action = resolve_key(key, { current_tool: app.GUI.GUI_tools.active_tool, can_use_tool });
		if (action.type === 'pass') return;
		if (action.type === 'command' && action.native && can_run(action.target)) return;
		event.preventDefault();
		event.stopImmediatePropagation();
		switch (action.type) {
			case 'tool':
				if (can_use_tool(action.name)) app.GUI.GUI_tools.activate_tool(action.name);
				else notify_tool(action.name);
				break;
			case 'command':
				if (!can_run(action.target)) notify_command(action.target);
				else if (!action.native) run_command(action.target);
				break;
			case 'brush_size':
				change_brush_size(action.delta);
				break;
			default:
				break;
		}
	}, true);
}

export function run_command(target) {
	const [module, fn] = target.split('.');
	const object = app.GUI.modules[module];
	if (object && typeof object[fn] === 'function') object[fn]();
}

/** [ and ]: a smaller or bigger brush, in steps that grow with the size. */
function change_brush_size(delta) {
	const attributes = config.TOOL && config.TOOL.attributes;
	if (!attributes || attributes.size === undefined) return;
	const read = typeof attributes.size === 'object' ? attributes.size.value : attributes.size;
	const step = read < 10 ? 1 : read < 50 ? 5 : 10;
	const value = Math.max(1, Math.min(500, read + delta * step));
	if (typeof attributes.size === 'object') attributes.size.value = value;
	else attributes.size = value;
	app.GUI.GUI_tools.show_action_attributes();
}

/** Dropped and pasted files open only where the lesson allows it. */
function guard_files() {
	const block = (target) => (event) => {
		if (is_typing(event.target) || can_run(target)) return;
		event.preventDefault();
		event.stopImmediatePropagation();
		if (event.type !== 'dragover') notify_command(target);
	};
	window.addEventListener('dragover', block('file/open.open_file'), true);
	window.addEventListener('drop', block('file/open.open_file'), true);
	window.addEventListener('paste', block('edit/paste.paste'), true);
}

async function load_start() {
	const doc = build_document(lesson.start, paint_on_canvas);
	await app.FileOpen.load_json(doc);
	// The starting picture is not the student's work: it cannot be undone and it is not in the journal.
	app.State.action_history = [];
	app.State.action_history_index = 0;
	journal.length = 0;
	start_layers = plain_layers(config.layers);
	app.GUI.GUI_preview.zoom_auto && app.GUI.GUI_preview.zoom_auto();
}

/** The picture as one image, for the pixel checks. */
function flatten() {
	const canvas = document.createElement('canvas');
	canvas.width = config.WIDTH;
	canvas.height = config.HEIGHT;
	const ctx = canvas.getContext('2d');
	app.Layers.convert_layers_to_canvas(ctx, null, false);
	return ctx.getImageData(0, 0, canvas.width, canvas.height);
}

export async function snapshot() {
	return {
		width: config.WIDTH,
		height: config.HEIGHT,
		layers: plain_layers(config.layers),
		start: { layers: start_layers },
		journal: [...journal],
		image: flatten(),
	};
}

export { get_policy };
