/**
 * EduProstir: a plain copy of the document for the checks (see checks.js).
 * Pure functions: the editor passes its layers in, tests pass hand-made ones.
 */

import { SHAPE_TYPES } from './checks.js';

/** Defaults of the text tool for spans that do not set their own colour. */
const TEXT_DEFAULTS = { fill_color: '#008800', stroke_size: 0, stroke_color: '#000000' };

/** `#rrggbb00` and `transparent` are no colour at all. */
function visible_color(value) {
	if (typeof value !== 'string' || value === '' || value === 'transparent') return null;
	if (/^#[0-9a-f]{6}00$/i.test(value) || /^#[0-9a-f]{3}0$/i.test(value)) return null;
	return value;
}

function text_of(layer) {
	if (!Array.isArray(layer.data)) return '';
	return layer.data.map((line) => (Array.isArray(line) ? line.map((span) => span.text ?? '').join('') : '')).join('\n');
}

/** Colours of a layer, the same way for every type: `fill` and `stroke` are a CSS colour or null. */
export function paint_of(layer) {
	const params = layer.params ?? {};
	if (SHAPE_TYPES.includes(layer.type)) {
		const stroke_size = Number(params.border_size) || 0;
		return {
			fill: params.fill ? visible_color(params.fill_color) : null,
			stroke: params.border && stroke_size > 0 ? visible_color(params.border_color) : null,
			stroke_size: params.border ? stroke_size : 0,
		};
	}
	if (layer.type === 'text') {
		const first = Array.isArray(layer.data) && Array.isArray(layer.data[0]) && layer.data[0][0] ? layer.data[0][0].meta ?? {} : {};
		const stroke_size = Number(first.stroke_size ?? TEXT_DEFAULTS.stroke_size) || 0;
		return {
			fill: visible_color(first.fill_color ?? TEXT_DEFAULTS.fill_color),
			stroke: stroke_size > 0 ? visible_color(first.stroke_color ?? TEXT_DEFAULTS.stroke_color) : null,
			stroke_size,
		};
	}
	if (['brush', 'pencil', 'line', 'arrow', 'bezier_curve'].includes(layer.type)) {
		const size = Number(params.size) || 1;
		return { fill: null, stroke: visible_color(layer.color), stroke_size: size };
	}
	return { fill: null, stroke: null, stroke_size: 0 };
}

/** The two colours of a gradient layer, or null. */
function colors_of(layer) {
	if (layer.type !== 'gradient' || !layer.params) return null;
	// `alpha` is the opacity of the second colour, in %: an almost transparent end is no colour.
	const alpha = layer.params.alpha === undefined ? 100 : Number(layer.params.alpha);
	return [visible_color(layer.params.color_1), alpha >= 50 ? visible_color(layer.params.color_2) : null];
}

/** The points of a finished Bézier curve on the canvas, or null while it is drawn. */
function curve_of(layer) {
	if (layer.type !== 'bezier_curve' || !layer.data) return null;
	const d = layer.data;
	if (!d.start || !d.cp1 || !d.cp2 || !d.end || [d.start, d.cp1, d.cp2, d.end].some((p) => p.x === null || p.y === null)) return null;
	const x = Number(layer.x) || 0;
	const y = Number(layer.y) || 0;
	const at = (p) => ({ x: x + p.x, y: y + p.y });
	return { start: at(d.start), cp1: at(d.cp1), cp2: at(d.cp2), end: at(d.end) };
}

/**
 * One layer for the checks. `index` is the place in the stack: 0 is the bottom layer.
 */
export function plain_layer(layer, index) {
	return {
		id: layer.id,
		name: layer.name,
		type: layer.type,
		x: Number(layer.x) || 0,
		y: Number(layer.y) || 0,
		width: Number(layer.width) || 0,
		height: Number(layer.height) || 0,
		visible: layer.visible !== false,
		index,
		...paint_of(layer),
		text: layer.type === 'text' ? text_of(layer) : null,
		corners: layer.params && layer.params.corners !== undefined ? Number(layer.params.corners) : null,
		colors: colors_of(layer),
		curve: curve_of(layer),
	};
}

/** Layers from the bottom of the stack to the top. Empty layers (no type) are left out. */
export function plain_layers(layers) {
	return [...layers]
		.sort((a, b) => a.order - b.order)
		.filter((l) => l.type !== null && l.type !== undefined)
		.map((l, i) => plain_layer(l, i));
}
