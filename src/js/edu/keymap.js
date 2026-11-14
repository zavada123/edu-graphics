/**
 * EduProstir: keyboard shortcuts of a typical photo editor (V — переміщення, B — пензель, Ctrl+J — дублювати
 * шар…). The trainer owns the keyboard: a key that is not in this map does nothing, so the keys of the
 * original editor and browser shortcuts like Ctrl+S cannot open a tool the lesson has closed.
 *
 * Keys are matched by `event.code` (the physical key), so they work with the Ukrainian layout too.
 */

import { menu_commands } from './menu.js';
import { TOOLS } from './policy.js';

const CODE_OF = { '=': 'Equal', '-': 'Minus', '[': 'BracketLeft', ']': 'BracketRight', '\'': 'Quote', Delete: 'Delete' };

/** Extra physical keys for the same shortcut (the numeric keypad). */
const ALIASES = { Equal: ['NumpadAdd'], Minus: ['NumpadSubtract'], Digit0: ['Numpad0'], Digit1: ['Numpad1'] };

/**
 * 'Ctrl+Shift+N' → { ctrl: true, shift: true, alt: false, codes: ['KeyN'] }
 *
 * @param {string} text
 */
export function parse_shortcut(text) {
	const parts = text.split('+');
	// "Ctrl+=" and "Ctrl+-" end with the key itself; "Ctrl++" is not used.
	const key = parts[parts.length - 1];
	const mods = parts.slice(0, -1).map((p) => p.toLowerCase());
	let code;
	if (/^[A-Z]$/i.test(key)) code = 'Key' + key.toUpperCase();
	else if (/^[0-9]$/.test(key)) code = 'Digit' + key;
	else if (/^F[0-9]{1,2}$/.test(key)) code = key;
	else if (CODE_OF[key] !== undefined) code = CODE_OF[key];
	else throw new Error('Unknown key in shortcut: ' + text);
	return {
		ctrl: mods.includes('ctrl'),
		shift: mods.includes('shift'),
		alt: mods.includes('alt'),
		codes: [code, ...(ALIASES[code] ?? [])],
	};
}

const same_mods = (combo, e) => combo.ctrl === e.ctrl && combo.shift === e.shift && combo.alt === e.alt;

/** Shortcuts of the menu, and a few more that the menu does not show. */
function command_shortcuts() {
	const list = menu_commands()
		.filter((c) => c.shortcut && !c.display_only)
		.map((c) => ({ combo: parse_shortcut(c.shortcut), target: c.target, native: !!c.native }));
	list.push({ combo: parse_shortcut('Ctrl+Y'), target: 'edit/redo.redo', native: false });
	list.push({ combo: parse_shortcut('Ctrl+Shift+S'), target: 'file/save.save', native: false });
	list.push({ combo: parse_shortcut('Ctrl+Alt+Z'), target: 'edit/undo.undo', native: false });
	return list;
}

const COMMANDS = command_shortcuts();

/** Keys the tools handle themselves: they always reach the editor. */
const PASS = new Set(['Escape', 'Enter', 'NumpadEnter', 'Backspace', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight',
	'ShiftLeft', 'ShiftRight', 'AltLeft', 'AltRight', 'ControlLeft', 'ControlRight', 'MetaLeft', 'MetaRight', 'Space', 'Tab', 'F11']);

/** Tools grouped by key, in the order Shift + key goes through them. */
export const TOOL_GROUPS = (() => {
	const groups = {};
	for (const [name, tool] of Object.entries(TOOLS)) {
		if (!tool.key) continue;
		const code = 'Key' + tool.key;
		(groups[code] ??= []).push(name);
	}
	return groups;
})();

/**
 * What a key press does.
 *
 * @param {{ code: string, ctrl: boolean, shift: boolean, alt: boolean }} e  ctrl is Ctrl or ⌘
 * @param {{ current_tool: string, can_use_tool: (name: string) => boolean }} ctx
 * @returns {{ type: 'tool', name: string } | { type: 'command', target: string, native: boolean }
 *   | { type: 'brush_size', delta: number } | { type: 'pass' } | { type: 'block' }}
 */
export function resolve_key(e, ctx) {
	for (const c of COMMANDS) {
		if (same_mods(c.combo, e) && c.combo.codes.includes(e.code)) return { type: 'command', target: c.target, native: c.native };
	}
	if (!e.ctrl && !e.alt) {
		const group = TOOL_GROUPS[e.code];
		if (group !== undefined) {
			const open = group.filter((name) => ctx.can_use_tool(name));
			// A closed tool: the policy shows «знадобиться пізніше» for the first tool of the group.
			if (open.length === 0) return { type: 'tool', name: group[0] };
			const at = open.indexOf(ctx.current_tool);
			if (e.shift) return { type: 'tool', name: open[(at + 1) % open.length] };
			return { type: 'tool', name: at >= 0 ? ctx.current_tool : open[0] };
		}
		if (!e.shift && e.code === 'BracketLeft') return { type: 'brush_size', delta: -1 };
		if (!e.shift && e.code === 'BracketRight') return { type: 'brush_size', delta: 1 };
		if (e.code === 'Delete') return { type: 'pass' };
	}
	if (PASS.has(e.code)) return { type: 'pass' };
	return { type: 'block' };
}

/** For the «Гарячі клавіші» window: tools and menu commands with their keys. */
export function shortcut_list() {
	const tools = Object.entries(TOOLS)
		.filter(([, t]) => t.key)
		.map(([name, t]) => ({ keys: t.key + (TOOL_GROUPS['Key' + t.key].length > 1 ? ' (Shift+' + t.key + ' — наступний)' : ''), label: t.label, tool: name }));
	const commands = menu_commands()
		.filter((c) => c.shortcut)
		.map((c) => ({ keys: c.shortcut, label: c.path.join(' → '), target: c.target }));
	return { tools, commands };
}
