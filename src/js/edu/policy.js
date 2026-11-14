/**
 * EduProstir: which tools and commands a lesson opens.
 *
 * A lesson manifest:
 *   {
 *     tools:    ['select', 'brush', 'shape'],   // tools of the left bar that work
 *     shapes:   ['rectangle', 'ellipse'],       // shapes the «Фігури» tool offers ('*' for all)
 *     commands: ['file/save.export', 'layer/*'],// menu commands that work ('*' at the end is a prefix)
 *     hidden:   ['crop', 'effects/*'],          // not shown at all: the topic is far ahead
 *     all:      true,                           // free drawing: everything is open
 *   }
 * Anything not opened and not hidden is shown grey with «Цей інструмент знадобиться пізніше», so the student
 * sees the whole editor. The same rules guard the tool bar, the menu, the keys, drag and drop and paste.
 */

export const STATES = { on: 'on', later: 'later', hidden: 'hidden' };

export const LATER_HINT = 'Цей інструмент знадобиться пізніше';

/**
 * Tools of the left bar, with the names of a typical photo editor and its usual keys. `cycle` is the group
 * that Shift + the key goes through, as in those editors.
 */
export const TOOLS = {
	select: { label: 'Переміщення', key: 'V', about: 'Перетягує шар, змінює його розмір і поворот.' },
	selection: { label: 'Прямокутне виділення', key: 'M', about: 'Виділяє прямокутну ділянку. Shift — квадрат, Esc — зняти виділення.' },
	brush: { label: 'Пензель', key: 'B', about: 'Малює м\'якою лінією поточним кольором.' },
	pencil: { label: 'Олівець', key: 'B', about: 'Малює чіткою лінією без згладжування.' },
	pick_color: { label: 'Піпетка', key: 'I', about: 'Бере колір з малюнка.' },
	erase: { label: 'Гумка', key: 'E', about: 'Стирає частину шару.' },
	magic_erase: { label: 'Чарівна гумка', key: 'E', about: 'Стирає ділянку одного кольору одним клацанням.' },
	fill: { label: 'Заливка', key: 'G', about: 'Заповнює замкнену ділянку поточним кольором.' },
	gradient: { label: 'Градієнт', key: 'G', about: 'Плавний перехід між двома кольорами.' },
	shape: { label: 'Фігури', key: 'U', about: 'Прямокутник, еліпс, лінія, зірка та інші фігури з контуром і заливкою.' },
	text: { label: 'Текст', key: 'T', about: 'Напис на окремому текстовому шарі.' },
	clone: { label: 'Штамп', key: 'S', about: 'Копіює одну частину малюнка в іншу. Alt + клацання — звідки брати.' },
	crop: { label: 'Рамка (кадрування)', key: 'C', about: 'Обрізає зображення до вибраної рамки.' },
	blur: { label: 'Розмиття', key: '', about: 'Розмиває ділянку під пензлем.' },
	sharpen: { label: 'Різкість', key: '', about: 'Робить ділянку під пензлем різкішою.' },
	desaturate: { label: 'Губка (знебарвлення)', key: 'O', about: 'Забирає колір з ділянки під пензлем.' },
	bulge_pinch: { label: 'Деформація', key: '', about: 'Роздуває або стискає ділянку.' },
	media: { label: 'Пошук зображень', key: '', about: '' },
	animation: { label: 'Анімація', key: '', about: '' },
};

/** Tools that a school lesson never shows: they reach the internet or are outside the curriculum. */
export const ALWAYS_HIDDEN = ['media', 'animation', 'bulge_pinch', 'file/open.search', 'file/open.open_url',
	'file/open.open_webcam', 'file/open.open_dir', 'file/open.open_data_url', 'file/open.open_template_test',
	'file/save.save_data_url', 'file/quicksave.quicksave', 'file/quickload.quickload', 'tools/*'];

/** Commands every lesson has: undo, zoom and help. */
export const ALWAYS_ON = ['edit/undo.undo', 'edit/redo.redo', 'view/zoom.*', 'help/*'];

/** Shapes of the «Фігури» tool. */
export const SHAPES = {
	rectangle: 'Прямокутник',
	ellipse: 'Еліпс',
	line: 'Лінія',
	arrow: 'Стрілка',
	triangle: 'Трикутник',
	right_triangle: 'Прямокутний трикутник',
	romb: 'Ромб',
	parallelogram: 'Паралелограм',
	trapezoid: 'Трапеція',
	pentagon: 'П\'ятикутник',
	hexagon: 'Шестикутник',
	polygon: 'Багатокутник',
	star: 'Зірка',
	plus: 'Плюс',
	heart: 'Серце',
	moon: 'Місяць',
	tear: 'Крапля',
	cylinder: 'Циліндр',
	cog: 'Шестерня',
	callout: 'Виноска',
	pie: 'Сектор',
	human: 'Людина',
	bezier_curve: 'Крива (перо)',
};

/** Does a name match a pattern: exact, or a prefix ending in `*`. */
export function matches_pattern(name, pattern) {
	if (pattern.endsWith('*')) return name.startsWith(pattern.slice(0, -1));
	return name === pattern;
}

const any = (name, patterns) => (patterns ?? []).some((p) => matches_pattern(name, p));

/** The full manifest of free drawing. */
export const FREE = { all: true, tools: [], shapes: [], commands: [], hidden: [] };

export class Policy {
	constructor(manifest) {
		this.manifest = { tools: [], shapes: [], commands: [], hidden: [], all: false, ...manifest };
	}

	/** State of a tool of the left bar, or of a shape of «Фігури» (a shape is never grey). */
	tool_state(name) {
		if (Object.prototype.hasOwnProperty.call(SHAPES, name)) return this.shape_on(name) ? STATES.on : STATES.hidden;
		if (any(name, ALWAYS_HIDDEN) || !Object.prototype.hasOwnProperty.call(TOOLS, name)) return STATES.hidden;
		if (this.manifest.all || this.manifest.tools.includes(name)) return STATES.on;
		return any(name, this.manifest.hidden) ? STATES.hidden : STATES.later;
	}

	shape_on(name) {
		if (this.manifest.all) return true;
		if (!this.manifest.tools.includes('shape')) return false;
		return this.manifest.shapes.includes('*') || this.manifest.shapes.includes(name);
	}

	command_state(target) {
		if (any(target, ALWAYS_HIDDEN)) return STATES.hidden;
		if (any(target, ALWAYS_ON) || target.startsWith('edu/')) {
			// Free transform belongs to the move tool.
			if (target === 'edu/commands.free_transform') return this.tool_state('select');
			return STATES.on;
		}
		if (this.manifest.all || any(target, this.manifest.commands)) return STATES.on;
		return any(target, this.manifest.hidden) ? STATES.hidden : STATES.later;
	}

	can_use_tool(name) {
		return this.tool_state(name) === STATES.on;
	}

	can_run(target) {
		return this.command_state(target) === STATES.on;
	}

	/**
	 * The menu for this lesson: hidden commands are removed, grey ones are marked `edu_later`, empty submenus
	 * and doubled or edge dividers disappear.
	 */
	filter_menu(items) {
		const out = [];
		for (const item of items) {
			if (item.divider) {
				if (out.length > 0 && !out[out.length - 1].divider) out.push(item);
				continue;
			}
			if (item.children) {
				const children = this.filter_menu(item.children);
				if (children.length > 0) out.push({ ...item, children, edu_later: children.every((c) => c.divider || c.edu_later) });
				continue;
			}
			const state = this.command_state(item.target);
			if (state === STATES.hidden) continue;
			out.push(state === STATES.later ? { ...item, edu_later: true } : item);
		}
		while (out.length > 0 && out[out.length - 1].divider) out.pop();
		return out;
	}
}
