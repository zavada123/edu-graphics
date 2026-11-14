/**
 * EduProstir: the lesson's policy as one shared object. The editor's own files ask it before they open a
 * tool or run a menu command (see the `EduProstir:` notes in actions/activate-tool.js, core/base-gui.js,
 * core/gui/gui-menu.js and tools/shape.js).
 */

import alertify from './../../../node_modules/alertifyjs/build/alertify.min.js';
import { FREE, LATER_HINT, Policy, STATES } from './policy.js';

let policy = new Policy(FREE);

export function set_policy(next) {
	policy = next;
}

export const get_policy = () => policy;

let file_name = null;

/** The name «Зберегти як» offers: the lesson's, not the name of the bottom layer. */
export function set_file_name(name) {
	file_name = name;
}

export const get_file_name = () => file_name;

export const can_use_tool = (name) => policy.can_use_tool(name);

export const can_run = (target) => policy.can_run(target);

let last_notice = 0;

/** Tells the student why nothing happened. One message at a time. */
export function notify_closed(state) {
	const now = Date.now();
	if (now - last_notice < 1200) return;
	last_notice = now;
	alertify.message(state === STATES.hidden ? 'На цьому уроці цього інструмента немає' : LATER_HINT, 3);
}

export function notify_tool(name) {
	notify_closed(policy.tool_state(name));
}

export function notify_command(target) {
	notify_closed(policy.command_state(target));
}
