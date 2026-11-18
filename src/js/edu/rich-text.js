/**
 * Markup for task and hint texts. The same rules are in every eduprostir trainer (edu-* repositories and
 * mriya-study, there as rich-text.ts); the convention is in mriya-study docs/trainer-text-markup.md.
 *
 *   **Створити**        name of a button, menu, field, tab or window: bold, in the accent color
 *   [k]Ctrl+C[/k]       keys: each key is a keyboard key, «+» between them
 *   `800`               text to type exactly
 *   [red]червоний[/red] a term in its color: red, green, blue, yellow, orange, purple
 *   «Сонце»             name of a file, layer or other object: highlighted, the quotes stay
 *
 * rich_html escapes every part, so a text cannot add tags or scripts. Markup does not nest.
 */

const MARK = /\*\*(.+?)\*\*|\[k\](.+?)\[\/k\]|`([^`]+)`|\[(red|green|blue|yellow|orange|purple)\](.+?)\[\/\4\]|«([^«»\n]+)»/g;

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c]);

/** «Ctrl+Shift+S» → ['Ctrl', 'Shift', 'S']; «Ctrl++» → ['Ctrl', '+']. */
export const split_keys = (keys) => keys.split(/(?<=\S)\s*\+\s*(?=\S)/).map((k) => k.trim()).filter((k) => k !== '');

/** Parts of a marked text: { kind: 'text' | 'ui' | 'keys' | 'code' | 'color' | 'name', text, keys?, color? }. */
export function parse_rich(source) {
	const parts = [];
	let last = 0;
	for (const m of String(source).matchAll(MARK)) {
		if (m.index > last) parts.push({ kind: 'text', text: source.slice(last, m.index) });
		const [, ui, keys, code, color, colored, name] = m;
		if (ui !== undefined) parts.push({ kind: 'ui', text: ui });
		else if (keys !== undefined) parts.push({ kind: 'keys', keys: split_keys(keys), text: keys });
		else if (code !== undefined) parts.push({ kind: 'code', text: code });
		else if (color !== undefined) parts.push({ kind: 'color', color, text: colored });
		else parts.push({ kind: 'name', text: name });
		last = m.index + m[0].length;
	}
	if (last < source.length) parts.push({ kind: 'text', text: source.slice(last) });
	return parts;
}

const part_html = (p) => {
	switch (p.kind) {
		case 'ui': return `<strong class="rt-ui">${esc(p.text)}</strong>`;
		case 'code': return `<code class="rt-code">${esc(p.text)}</code>`;
		case 'name': return `<span class="rt-name">«${esc(p.text)}»</span>`;
		case 'color': return `<span class="rt-color rt-${p.color}">${esc(p.text)}</span>`;
		case 'keys': return `<span class="rt-keys">${p.keys.map((k) => `<kbd class="rt-key">${esc(k)}</kbd>`).join('<span class="rt-plus">+</span>')}</span>`;
		default: return esc(p.text);
	}
};

/** Escaped HTML of a marked text. */
export const rich_html = (source) => parse_rich(String(source)).map(part_html).join('');

/** The text without markup: for aria-label, title and comparisons. */
export const plain_text = (source) => parse_rich(String(source)).map((p) => (p.kind === 'keys' ? p.keys.join('+') : p.kind === 'name' ? `«${p.text}»` : p.text)).join('');
