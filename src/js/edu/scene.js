/**
 * EduProstir: the starting picture of a lesson, described in a few lines and turned into the editor's own
 * JSON document (the same format as «Зберегти як проєкт із шарами»).
 *
 * start: {
 *   width, height,
 *   layers: [                                  // bottom to top
 *     { kind: 'fill', name: 'Тло', color: '#ffffff' },
 *     { kind: 'shape', type: 'ellipse', name: 'Сонце', x, y, w, h, fill: '#facc15', stroke: null, stroke_size: 0 },
 *     { kind: 'text', name: 'Напис', x, y, text: 'Ярмарок', size: 40, fill: '#1f2937', stroke: null },
 *     { kind: 'image', name: 'Малюнок', draw: (ctx, width, height) => { ... } },  // drawn in the browser
 *   ]
 * }
 */

const VERSION = '4.14.3';

const base_layer = (id, name, type, extra) => ({
	id,
	parent_id: 0,
	name,
	type,
	link: null,
	x: 0,
	y: 0,
	width: 0,
	width_original: null,
	height: 0,
	height_original: null,
	visible: true,
	is_vector: type !== 'image',
	hide_selection_if_active: false,
	opacity: 100,
	order: id,
	composition: 'source-over',
	rotate: 0,
	data: null,
	params: {},
	status: null,
	color: null,
	filters: [],
	render_function: type === 'image' ? null : [type, 'render'],
	...extra,
});

function shape_params(spec) {
	const params = {
		border_size: spec.stroke_size ?? 4,
		border: spec.stroke !== null && spec.stroke !== undefined,
		fill: spec.fill !== null && spec.fill !== undefined,
		border_color: spec.stroke ?? '#555555',
		fill_color: spec.fill ?? '#aaaaaa',
	};
	if (spec.type === 'star') {
		params.corners = spec.corners ?? 5;
		params.inner_radius = spec.inner_radius ?? 40;
	}
	if (spec.type === 'rectangle') {
		params.radius = spec.radius ?? 0;
		params.square = false;
	}
	if (spec.type === 'ellipse') params.circle = false;
	return params;
}

/**
 * @param {object} start the lesson's `start`
 * @param {(spec: object, width: number, height: number) => string} paint makes a PNG data URL for
 *   'fill' and 'image' layers (a canvas in the browser; tests pass a stub)
 * @returns {object} the editor's JSON document
 */
export function build_document(start, paint) {
	const layers = [];
	const data = [];
	start.layers.forEach((spec, i) => {
		const id = i + 1;
		switch (spec.kind) {
			case 'fill':
			case 'image':
				layers.push(base_layer(id, spec.name, 'image', { width: start.width, height: start.height, width_original: start.width, height_original: start.height }));
				data.push({ id, data: paint(spec, start.width, start.height) });
				break;
			case 'shape':
				layers.push(base_layer(id, spec.name, spec.type, { x: spec.x, y: spec.y, width: spec.w, height: spec.h, params: shape_params(spec) }));
				break;
			case 'text':
				layers.push(base_layer(id, spec.name, 'text', {
					x: spec.x,
					y: spec.y,
					width: spec.w ?? Math.round(spec.text.length * spec.size * 0.6),
					height: Math.round(spec.size * 1.2),
					color: spec.fill ?? '#1f2937',
					params: { boundary: 'dynamic', kerning: 'metrics', text_direction: 'ltr', wrap_direction: 'ttb', halign: 'left', valign: 'top', wrap: 'letter' },
					data: [[{
						text: spec.text,
						meta: {
							size: spec.size,
							family: 'Arial',
							fill_color: spec.fill ?? '#1f2937',
							stroke_size: spec.stroke ? spec.stroke_size ?? 2 : 0,
							stroke_color: spec.stroke ?? '#000000',
						},
					}]],
				}));
				break;
			default:
				throw new Error('Unknown start layer: ' + spec.kind);
		}
	});
	return {
		info: {
			width: start.width,
			height: start.height,
			about: 'EduProstir lesson start',
			date: '2026-01-01',
			version: VERSION,
			layer_active: layers.length,
			guides: [],
		},
		user_fonts: {},
		layers,
		data,
	};
}

/** Paints a 'fill' or 'image' start layer on a canvas and returns a PNG data URL. Browser only. */
export function paint_on_canvas(spec, width, height) {
	const canvas = document.createElement('canvas');
	canvas.width = width;
	canvas.height = height;
	const ctx = canvas.getContext('2d');
	if (spec.kind === 'fill') {
		ctx.fillStyle = spec.color;
		ctx.fillRect(0, 0, width, height);
	} else {
		spec.draw(ctx, width, height);
	}
	return canvas.toDataURL('image/png');
}
