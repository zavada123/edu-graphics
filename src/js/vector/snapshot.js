/**
 * EduProstir, vector mode: the drawing of SVG-Edit as plain descriptions for `layers_of` (svg.js).
 * Boxes are in the units of the drawing (800 × 500), whatever the zoom; colours are `#rrggbb`.
 */

import { layers_of, paint_ref, TYPE_OF_TAG } from './svg.js';

const SKIP = new Set(['title', 'desc', 'defs', 'metadata', 'style', 'script']);

const probe = document.createElement('canvas').getContext('2d');

/** Any CSS colour as `#rrggbb` (the browser parses it); null when it is not a colour. */
function to_hex(value) {
	probe.fillStyle = '#010203';
	probe.fillStyle = value;
	const read = probe.fillStyle;
	if (read === '#010203' && value.trim().toLowerCase() !== '#010203') return null;
	if (read.startsWith('#')) return read;
	const m = read.match(/rgba?\(([^)]+)\)/);
	if (!m) return null;
	const [r, g, b] = m[1].split(',').map((n) => Number(n.trim()));
	return '#' + [r, g, b].map((n) => n.toString(16).padStart(2, '0')).join('');
}

const own_title = (el) => {
	const t = [...el.children].find((c) => c.tagName.toLowerCase() === 'title');
	return t ? t.textContent.trim() : el.getAttribute('data-name') ?? '';
};

/** Stops of a gradient, following `href` to the gradient that holds them. */
function stops_of(root, gradient, depth = 0) {
	const stops = [...gradient.querySelectorAll('stop')];
	if (stops.length > 0 || depth > 4) return stops;
	const href = gradient.getAttribute('href') ?? gradient.getAttributeNS('http://www.w3.org/1999/xlink', 'href');
	const next = href && href.startsWith('#') ? root.querySelector('#' + CSS.escape(href.slice(1))) : null;
	return next ? stops_of(root, next, depth + 1) : [];
}

function gradient_of(root, id) {
	const node = root.querySelector('#' + CSS.escape(id));
	if (!node) return null;
	const kind = node.tagName.toLowerCase() === 'radialgradient' ? 'radial' : node.tagName.toLowerCase() === 'lineargradient' ? 'linear' : null;
	if (kind === null) return null;
	const stops = stops_of(root, node);
	if (stops.length === 0) return null;
	const color = (s) => to_hex(s.getAttribute('stop-color') ?? getComputedStyle(s).stopColor ?? '#000000');
	return { kind, colors: [color(stops[0]), color(stops[stops.length - 1])] };
}

function paint(root, el, name, fallback) {
	const ref = paint_ref(el.getAttribute(name), fallback);
	if (ref.kind === 'none') return { color: null, gradient: null };
	if (ref.kind === 'url') {
		const g = gradient_of(root, ref.id);
		return { color: g ? g.colors[0] : null, gradient: g };
	}
	return { color: to_hex(ref.value), gradient: null };
}

/**
 * @param {SVGSVGElement} root  the drawing of SVG-Edit (#svgcontent)
 * @param {number} zoom         the zoom of the editor (1 is 100 %)
 */
export function read_drawing(root, zoom) {
	const base = root.getBoundingClientRect();
	const elements = [];
	const walk = (parent, groups, visible) => {
		for (const el of parent.children) {
			const tag = el.tagName.toLowerCase();
			if (SKIP.has(tag) || TYPE_OF_TAG[tag] === undefined) continue;
			const shown = visible && el.getAttribute('display') !== 'none' && el.style.display !== 'none';
			const r = el.getBoundingClientRect();
			const fill = paint(root, el, 'fill', '#000000');
			const stroke = paint(root, el, 'stroke', null);
			const id = el.id;
			elements.push({
				id,
				tag,
				name: own_title(el),
				box: { x: (r.left - base.left) / zoom, y: (r.top - base.top) / zoom, w: r.width / zoom, h: r.height / zoom },
				visible: shown,
				fill: fill.color,
				stroke: stroke.color,
				stroke_width: Number(el.getAttribute('stroke-width') ?? 1),
				text: tag === 'text' ? el.textContent : null,
				d: tag === 'path' ? el.getAttribute('d') : null,
				gradient: fill.gradient,
				groups,
			});
			if (tag === 'g') walk(el, [...groups, id], shown);
		}
	};
	for (const layer of root.querySelectorAll(':scope > g.layer')) {
		walk(layer, [], layer.getAttribute('display') !== 'none' && layer.style.display !== 'none');
	}
	return layers_of(elements);
}
