/**
 * EduProstir, vector mode: what the trainer reads from an SVG drawing. Pure functions, tested in Node; the
 * walk over the live drawing is in snapshot.js.
 */

/** Layer types of the checks (the same names as in the raster mode), by SVG tag. */
export const TYPE_OF_TAG = {
	rect: 'rectangle',
	circle: 'ellipse',
	ellipse: 'ellipse',
	path: 'path',
	polygon: 'polygon',
	polyline: 'polygon',
	line: 'line',
	text: 'text',
	g: 'group',
	image: 'image',
	use: 'use',
};

/** Numbers each path command takes for one segment. */
const ARGS = { m: 2, l: 2, h: 1, v: 1, c: 6, s: 4, q: 4, t: 2, a: 7, z: 0 };

/** A curve whose control points stand this far (in units of the drawing) from its chord is visibly bent. */
export const BEND_MIN = 8;

/** Distance from the point to the line through a and b (to a when a and b are one point). */
function off_line(p, a, b) {
	const len = Math.hypot(b.x - a.x, b.y - a.y);
	if (len === 0) return Math.hypot(p.x - a.x, p.y - a.y);
	return Math.abs((b.x - a.x) * (a.y - p.y) - (a.x - p.x) * (b.y - a.y)) / len;
}

/**
 * Segments of a path: how many there are and how many of them are visibly curved. A "curve" of SVG-Edit
 * with its control points on the chord is still a straight line, so it does not count. A command letter may
 * stand for several segments (`C` with 12 numbers is two curves); a `M` with more pairs goes on as lines.
 *
 * @param {string} d the `d` attribute
 * @returns {{ nodes: number, curves: number }}
 */
export function path_info(d) {
	const tokens = String(d ?? '').match(/[a-zA-Z]|[-+]?(?:\d+\.?\d*|\.\d+)(?:[eE][-+]?\d+)?/g) ?? [];
	let nodes = 0;
	let curves = 0;
	let command = '';
	let args = [];
	let first_pair = true;
	let at = { x: 0, y: 0 };
	let begin = at;
	const point = (rel, x, y) => (rel ? { x: at.x + x, y: at.y + y } : { x, y });
	const run = () => {
		const c = command.toLowerCase();
		const rel = command !== command.toUpperCase();
		const n = args;
		let end = at;
		let bent = false;
		switch (c) {
			case 'm':
				end = point(rel, n[0], n[1]);
				if (first_pair) begin = end;
				else nodes += 1;
				first_pair = false;
				at = end;
				return;
			case 'l': end = point(rel, n[0], n[1]); break;
			case 'h': end = { x: rel ? at.x + n[0] : n[0], y: at.y }; break;
			case 'v': end = { x: at.x, y: rel ? at.y + n[0] : n[0] }; break;
			case 'c': {
				end = point(rel, n[4], n[5]);
				bent = Math.max(off_line(point(rel, n[0], n[1]), at, end), off_line(point(rel, n[2], n[3]), at, end)) >= BEND_MIN;
				break;
			}
			case 's':
			case 'q': {
				end = point(rel, n[2], n[3]);
				bent = off_line(point(rel, n[0], n[1]), at, end) >= BEND_MIN;
				break;
			}
			case 't': end = point(rel, n[0], n[1]); bent = true; break;
			case 'a': end = point(rel, n[5], n[6]); bent = n[0] > 0 && n[1] > 0; break;
			default: return;
		}
		nodes += 1;
		if (bent) curves += 1;
		at = end;
	};
	for (const token of tokens) {
		if (/^[a-zA-Z]$/.test(token)) {
			command = token;
			args = [];
			first_pair = true;
			if (token.toLowerCase() === 'z') at = begin;
			continue;
		}
		const need = ARGS[command.toLowerCase()];
		if (!need) continue;
		args.push(Number(token));
		if (args.length < need) continue;
		run();
		args = [];
	}
	return { nodes, curves };
}

/**
 * The text of a paint attribute: a colour, `none`, a gradient reference or nothing.
 *
 * @returns {{ kind: 'none' } | { kind: 'url', id: string } | { kind: 'color', value: string }}
 */
export function paint_ref(value, fallback) {
	const s = String(value ?? '').trim();
	if (s === '') return fallback === null ? { kind: 'none' } : { kind: 'color', value: fallback };
	if (s === 'none' || s === 'transparent') return { kind: 'none' };
	const url = s.match(/^url\(\s*['"]?#([^'")\s]+)['"]?\s*\)/);
	if (url) return { kind: 'url', id: url[1] };
	return { kind: 'color', value: s };
}

/**
 * One layer of the snapshot from a plain description of an SVG element, made by the walk in the browser:
 *   { id, tag, name, box: {x, y, w, h}, visible, fill: paint, stroke: paint, stroke_width, text, d, groups,
 *     gradient: { kind: 'linear' | 'radial', colors: [first, last] } | null }
 * Colours are already `#rrggbb` (the browser reads any CSS colour).
 */
export function layer_of(el, index) {
	const type = TYPE_OF_TAG[el.tag] ?? el.tag;
	const fill = el.gradient ? el.gradient.colors[0] : el.fill;
	const path = type === 'path' ? path_info(el.d) : { nodes: 0, curves: 0 };
	return {
		id: el.id,
		name: el.name,
		type,
		x: el.box.x,
		y: el.box.y,
		width: el.box.w,
		height: el.box.h,
		visible: el.visible,
		index,
		fill: type === 'group' || type === 'line' ? null : fill,
		stroke: type === 'group' ? null : el.stroke,
		stroke_size: el.stroke === null ? 0 : el.stroke_width,
		text: type === 'text' ? el.text : null,
		corners: null,
		colors: el.gradient ? el.gradient.colors : null,
		gradient: el.gradient ? el.gradient.kind : null,
		curves: path.curves,
		nodes: path.nodes,
		groups: el.groups,
	};
}

/** Layers in drawing order: what is drawn later is in front, as `index` says. */
export const layers_of = (elements) => elements.map((el, i) => layer_of(el, i + 1));
