/**
 * EduProstir: colour families.
 * A task says "a green fill", and any shade of green is accepted: the student picks the colour in the colour
 * picker, so an exact value would be unfair.
 */

export const COLOR_FAMILIES = ['red', 'orange', 'yellow', 'green', 'blue', 'purple', 'pink', 'brown', 'black', 'white', 'gray'];

/** Names in the form used in the task list: «червоний», «зелений». */
export const FAMILY_LABELS = {
	red: 'червоний',
	orange: 'помаранчевий',
	yellow: 'жовтий',
	green: 'зелений',
	blue: 'синій або блакитний',
	purple: 'фіолетовий',
	pink: 'рожевий',
	brown: 'коричневий',
	black: 'чорний',
	white: 'білий',
	gray: 'сірий',
};

/**
 * Parses `#rgb`, `#rrggbb` or `rgb(r, g, b)` / `rgba(...)`.
 *
 * @param {string} value
 * @returns {{r: number, g: number, b: number} | null} channels 0–255
 */
export function parse_color(value) {
	if (typeof value !== 'string') return null;
	const s = value.trim().toLowerCase();
	let m = /^#([0-9a-f]{3})$/.exec(s);
	if (m) {
		const [r, g, b] = m[1].split('').map((c) => parseInt(c + c, 16));
		return { r, g, b };
	}
	m = /^#([0-9a-f]{6})([0-9a-f]{2})?$/.exec(s);
	if (m) {
		return { r: parseInt(m[1].slice(0, 2), 16), g: parseInt(m[1].slice(2, 4), 16), b: parseInt(m[1].slice(4, 6), 16) };
	}
	m = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/.exec(s);
	if (m) return { r: +m[1], g: +m[2], b: +m[3] };
	return null;
}

/**
 * @param {{r: number, g: number, b: number}} rgb channels 0–255
 * @returns {{h: number, s: number, l: number}} hue in degrees, saturation and lightness 0–1
 */
export function to_hsl({ r, g, b }) {
	const rr = r / 255, gg = g / 255, bb = b / 255;
	const max = Math.max(rr, gg, bb);
	const min = Math.min(rr, gg, bb);
	const l = (max + min) / 2;
	const d = max - min;
	if (d === 0) return { h: 0, s: 0, l };
	const s = d / (1 - Math.abs(2 * l - 1));
	const h = max === rr ? ((gg - bb) / d + 6) % 6 : max === gg ? (bb - rr) / d + 2 : (rr - gg) / d + 4;
	return { h: h * 60, s, l };
}

/**
 * The family of an RGB colour.
 *
 * @param {{r: number, g: number, b: number}} rgb
 * @returns {string} one of COLOR_FAMILIES
 */
export function family_of_rgb(rgb) {
	const { h, s, l } = to_hsl(rgb);
	if (l >= 0.93) return 'white';
	if (l < 0.2) return 'black';
	if (s < 0.18) return 'gray';
	if (h < 15 || h >= 345) return l > 0.75 ? 'pink' : 'red';
	if (h < 42) return l < 0.4 ? 'brown' : 'orange';
	if (h < 70) return l < 0.3 ? 'brown' : 'yellow';
	if (h < 170) return 'green';
	if (h < 255) return 'blue';
	if (h < 290) return 'purple';
	return 'pink';
}

/**
 * @param {string} value a CSS colour
 * @returns {string | null} the family, or null when the value is not a colour
 */
export function color_family(value) {
	const rgb = parse_color(value);
	return rgb === null ? null : family_of_rgb(rgb);
}
