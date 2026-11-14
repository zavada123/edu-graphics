/**
 * EduProstir: conditions of a task.
 *
 * A check reads a snapshot of the document, never the editor itself, so the same code runs in the browser and
 * in tests. The snapshot is made by `snapshot.js`:
 *
 *   {
 *     width, height,                        // the canvas
 *     layers: [{ id, name, type, x, y, width, height, visible, index, fill, stroke, stroke_size, text, corners,
 *                colors, curve }],         // colors: the two colours of a gradient; curve: the points of a Bézier curve
 *     start: { layers: [...] },             // the same, at the start of the task
 *     journal: [{ kind, name, format }],    // tools used, commands run, files saved
 *     image: { width, height, data } | null,// the flattened picture, RGBA
 *     zoom: { now, max },                   // the zoom now and the biggest one since the start (1 is 100 %)
 *     answers: { [question id]: option index }
 *   }
 *
 * Every check has `text` (the line the student reads) and `hint` (shown while the condition is not met).
 */

import { color_family, family_of_rgb } from './colors.js';

/** Layer types the editor draws as vector shapes: they keep fill and outline as settings. */
export const SHAPE_TYPES = ['rectangle', 'ellipse', 'star', 'polygon', 'triangle', 'right_triangle', 'romb', 'parallelogram',
	'trapezoid', 'plus', 'pentagon', 'hexagon', 'heart', 'cylinder', 'tear', 'cog', 'moon', 'callout', 'pie', 'human'];

const norm = (s) => String(s).trim().replace(/\s+/g, ' ').toLocaleLowerCase('uk');

/**
 * A colour rule: a family name ("green"), a list of families (["yellow", "orange"]), "none" (no fill / no
 * outline) or "any" (some colour).
 *
 * @param {string | string[]} rule
 * @param {string | null} color
 */
export function color_ok(rule, color) {
	if (rule === 'none') return color === null;
	if (color === null || color === undefined) return false;
	if (rule === 'any') return true;
	const families = Array.isArray(rule) ? rule : [rule];
	return families.includes(color_family(color));
}

/** Two colours (of a gradient) match two rules, in any order. */
export function colors_ok(rules, colors) {
	if (!Array.isArray(colors) || colors.length < 2) return false;
	const [a, b] = rules;
	return (color_ok(a, colors[0]) && color_ok(b, colors[1])) || (color_ok(a, colors[1]) && color_ok(b, colors[0]));
}

/**
 * Does the layer match? Every field of `match` narrows the choice; `{}` matches every visible layer.
 *
 * match: { type: string | string[], name, fill, stroke, min_stroke, text, corners, min_size, visible, colors }
 */
export function layer_matches(layer, match) {
	if (match.visible !== false && layer.visible === false) return false;
	if (match.type !== undefined) {
		const types = Array.isArray(match.type) ? match.type : [match.type];
		if (!types.includes(layer.type)) return false;
	}
	if (match.name !== undefined && layer.name !== match.name) return false;
	if (match.fill !== undefined && !color_ok(match.fill, layer.fill)) return false;
	if (match.stroke !== undefined && !color_ok(match.stroke, layer.stroke)) return false;
	if (match.min_stroke !== undefined && (layer.stroke === null || layer.stroke_size < match.min_stroke)) return false;
	if (match.text !== undefined && (layer.text === null || norm(layer.text) !== norm(match.text))) return false;
	if (match.corners !== undefined && layer.corners !== match.corners) return false;
	if (match.min_size !== undefined && Math.min(Math.abs(layer.width), Math.abs(layer.height)) < match.min_size) return false;
	if (match.colors !== undefined && !colors_ok(match.colors, layer.colors)) return false;
	return true;
}

const find = (snapshot, match) => snapshot.layers.filter((l) => layer_matches(l, match));

/** Box of a layer, with a positive width and height. */
export function box_of(layer) {
	const x = layer.width < 0 ? layer.x + layer.width : layer.x;
	const y = layer.height < 0 ? layer.y + layer.height : layer.y;
	return { x, y, w: Math.abs(layer.width), h: Math.abs(layer.height) };
}

export function edge_of(box, edge) {
	switch (edge) {
		case 'left': return box.x;
		case 'right': return box.x + box.w;
		case 'top': return box.y;
		case 'bottom': return box.y + box.h;
		case 'center_x': return box.x + box.w / 2;
		case 'center_y': return box.y + box.h / 2;
		default: throw new Error('Unknown edge: ' + edge);
	}
}

const spread = (values) => (values.length === 0 ? 0 : Math.max(...values) - Math.min(...values));

/** Equal gaps, or equal steps between centres, in a row along the axis; the boxes do not overlap. */
export function evenly_spaced(boxes, axis, tolerance) {
	const start = axis === 'x' ? (b) => b.x : (b) => b.y;
	const size = axis === 'x' ? (b) => b.w : (b) => b.h;
	const sorted = [...boxes].sort((a, b) => start(a) - start(b));
	const gaps = [];
	const steps = [];
	for (let i = 1; i < sorted.length; i++) {
		const a = sorted[i - 1];
		const b = sorted[i];
		gaps.push(start(b) - (start(a) + size(a)));
		steps.push(start(b) + size(b) / 2 - (start(a) + size(a) / 2));
	}
	if (gaps.some((g) => g < -tolerance)) return false;
	return spread(gaps) <= tolerance * 2 || spread(steps) <= tolerance * 2;
}

/**
 * Pixels of a colour family in an area of the flattened picture.
 * Transparent pixels (alpha < 128) are not counted as any colour. The area is clipped to the picture.
 *
 * @returns {{ total: number, hits: number, sum_x: number, sum_y: number }}
 */
export function count_pixels(image, family, area) {
	const x0 = Math.max(0, Math.floor(area.x));
	const y0 = Math.max(0, Math.floor(area.y));
	const x1 = Math.min(image.width, Math.ceil(area.x + area.w));
	const y1 = Math.min(image.height, Math.ceil(area.y + area.h));
	// Big areas are sampled on a grid: the result is a share, a few thousand points are enough.
	const step = Math.max(1, Math.floor(Math.sqrt(((x1 - x0) * (y1 - y0)) / 40000)));
	let total = 0, hits = 0, sum_x = 0, sum_y = 0;
	for (let y = y0; y < y1; y += step) {
		for (let x = x0; x < x1; x += step) {
			total++;
			const i = (y * image.width + x) * 4;
			if (image.data[i + 3] < 128) continue;
			const f = family_of_rgb({ r: image.data[i], g: image.data[i + 1], b: image.data[i + 2] });
			if (f === family) {
				hits++;
				sum_x += x;
				sum_y += y;
			}
		}
	}
	return { total, hits, sum_x, sum_y };
}

/**
 * The shape of a cubic Bézier curve: `span` is the distance between its ends, `bend` how far the middle of the
 * curve stands from the middle of that chord, `up` whether the middle is higher than the chord (y grows down).
 *
 * @param {{ start, cp1, cp2, end }} curve points as { x, y }
 */
export function curve_shape(curve) {
	const { start, cp1, cp2, end } = curve;
	const mid = { x: (start.x + 3 * cp1.x + 3 * cp2.x + end.x) / 8, y: (start.y + 3 * cp1.y + 3 * cp2.y + end.y) / 8 };
	const chord = { x: (start.x + end.x) / 2, y: (start.y + end.y) / 2 };
	return {
		span: Math.hypot(end.x - start.x, end.y - start.y),
		bend: Math.hypot(mid.x - chord.x, mid.y - chord.y),
		up: mid.y < chord.y,
	};
}

const whole = (snapshot) => ({ x: 0, y: 0, w: snapshot.width, h: snapshot.height });

function evaluate(check, snapshot) {
	switch (check.type) {
		case 'layers': {
			const n = find(snapshot, check.match).length;
			return n >= (check.min ?? 1) && (check.max === undefined || n <= check.max);
		}
		case 'recolored': {
			// The same layer (same id) as at the start, but with another fill or outline.
			const before = snapshot.start.layers.find((l) => l.name === check.name);
			if (before === undefined) return false;
			const now = snapshot.layers.find((l) => l.id === before.id);
			if (now === undefined || !layer_matches(now, check.match ?? {})) return false;
			return now.fill !== before.fill || now.stroke !== before.stroke;
		}
		case 'in_front': {
			const front = find(snapshot, check.match);
			const back = find(snapshot, check.behind);
			if (front.length === 0 || back.length === 0) return false;
			return Math.min(...front.map((l) => l.index)) > Math.max(...back.map((l) => l.index));
		}
		case 'above': {
			// Every `match` layer is higher on the canvas than every `over` layer.
			const top = find(snapshot, check.match);
			const below = find(snapshot, check.over);
			if (top.length === 0 || below.length === 0) return false;
			const lowest = Math.max(...top.map((l) => edge_of(box_of(l), 'bottom')));
			const highest = Math.min(...below.map((l) => edge_of(box_of(l), 'top')));
			return lowest <= highest + (check.tolerance ?? 0);
		}
		case 'inside': {
			const a = check.area;
			return find(snapshot, check.match).some((l) => {
				const b = box_of(l);
				const cx = b.x + b.w / 2;
				const cy = b.y + b.h / 2;
				return cx >= a.x && cx <= a.x + a.w && cy >= a.y && cy <= a.y + a.h;
			});
		}
		case 'aligned': {
			const found = find(snapshot, check.match);
			if (found.length < (check.min ?? 2)) return false;
			return spread(found.map((l) => edge_of(box_of(l), check.edge))) <= (check.tolerance ?? 1) * 2;
		}
		case 'spaced': {
			const found = find(snapshot, check.match);
			if (found.length < (check.min ?? 3)) return false;
			return evenly_spaced(found.map(box_of), check.axis, check.tolerance ?? 1);
		}
		case 'canvas':
			return Math.abs(snapshot.width - check.width) <= (check.tolerance ?? 0)
				&& Math.abs(snapshot.height - check.height) <= (check.tolerance ?? 0);
		case 'pixels': {
			// A share of the area is painted in the colour family.
			if (snapshot.image === null) return false;
			const c = count_pixels(snapshot.image, check.family, check.area ?? whole(snapshot));
			return c.total > 0 && c.hits / c.total >= check.min_share;
		}
		case 'pixels_center': {
			// The pixels of the colour family, as one spot, have their centre in the area.
			if (snapshot.image === null) return false;
			const c = count_pixels(snapshot.image, check.family, whole(snapshot));
			if (c.hits < (check.min_pixels ?? 50)) return false;
			const cx = c.sum_x / c.hits;
			const cy = c.sum_y / c.hits;
			const a = check.area;
			return cx >= a.x && cx <= a.x + a.w && cy >= a.y && cy <= a.y + a.h;
		}
		case 'used':
			return snapshot.journal.some((e) => e.kind === check.kind && e.name === check.name);
		case 'saved': {
			// The last saved file is in one of the formats.
			const saves = snapshot.journal.filter((e) => e.kind === 'save');
			const last = saves[saves.length - 1];
			return last !== undefined && check.formats.includes(last.format);
		}
		case 'curve': {
			// A finished Bézier curve, long enough and bent enough (and to the side the task asks).
			return find(snapshot, { type: 'bezier_curve', ...check.match }).some((l) => {
				if (!l.curve) return false;
				const c = curve_shape(l.curve);
				if (c.span < (check.min_span ?? 0) || c.bend < (check.min_bend ?? 1)) return false;
				return check.bend === 'up' ? c.up : check.bend === 'down' ? !c.up : true;
			});
		}
		case 'zoom':
			// The student looked at the picture this close (1 is 100 %), at some moment of the task.
			return snapshot.zoom !== undefined && snapshot.zoom.max >= check.min;
		case 'answer':
			// The option the student picked in the question on the task card.
			return snapshot.answers !== undefined && snapshot.answers[check.question] === check.correct;
		default:
			throw new Error('Unknown check: ' + check.type);
	}
}

/**
 * @returns {Array<{ check: object, ok: boolean, text: string, hint: string }>}
 */
export function run_checks(checks, snapshot) {
	return checks.map((check) => ({ check, ok: evaluate(check, snapshot), text: check.text, hint: check.hint }));
}

export const all_met = (results) => results.length > 0 && results.every((r) => r.ok);
