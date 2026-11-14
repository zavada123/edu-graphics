/**
 * EduProstir: the main menu, arranged like the menus of common photo editors (Файл, Редагування, Зображення,
 * Шар, Виділення, Фільтр, Перегляд, Довідка), with the usual shortcuts. It replaces config-menu.js.
 *
 * `target` is "module.function" of src/js/modules, or of a module that edu/index.js registers (`edu/...`).
 * `shortcut` is shown in the menu and is also the key the trainer listens to (see keymap.js), unless
 * `display_only` is set: then the tools handle the key themselves.
 * `native` commands are not run by the trainer: the key goes on to the editor (copy and paste use the
 * browser clipboard events), the trainer only stops it while the command is closed.
 * A lesson opens commands by target (see policy.js); a closed command is grey or not shown.
 */

const menu = [
	{
		name: 'Файл',
		children: [
			{ name: 'Створити…', target: 'file/new.new', shortcut: 'Ctrl+N' },
			{ name: 'Відкрити…', target: 'file/open.open_file', shortcut: 'Ctrl+O' },
			{ divider: true },
			{ name: 'Зберегти як проєкт із шарами (JSON)…', target: 'file/save.save', shortcut: 'Ctrl+S' },
			{ name: 'Експортувати як зображення (PNG, JPG…)…', target: 'file/save.export', shortcut: 'Ctrl+Shift+Alt+W' },
			{ divider: true },
			{ name: 'Друк…', target: 'file/print.print', shortcut: 'Ctrl+P' },
		],
	},
	{
		name: 'Редагування',
		children: [
			{ name: 'Скасувати', target: 'edit/undo.undo', shortcut: 'Ctrl+Z' },
			{ name: 'Повторити', target: 'edit/redo.redo', shortcut: 'Ctrl+Shift+Z' },
			{ divider: true },
			{ name: 'Копіювати', target: 'edit/copy.copy_to_clipboard', shortcut: 'Ctrl+C', native: true },
			{ name: 'Вставити', target: 'edit/paste.paste', shortcut: 'Ctrl+V', native: true },
			{ name: 'Очистити виділене', target: 'edit/selection.delete', shortcut: 'Delete', display_only: true },
			{ divider: true },
			{ name: 'Вільне трансформування', target: 'edu/commands.free_transform', shortcut: 'Ctrl+T' },
		],
	},
	{
		name: 'Зображення',
		children: [
			{
				name: 'Корекція',
				children: [
					{ name: 'Яскравість…', target: 'effects/common/brightness.brightness' },
					{ name: 'Контрастність…', target: 'effects/common/contrast.contrast' },
					{ name: 'Насиченість…', target: 'effects/common/saturate.saturate' },
					{ name: 'Колірний тон…', target: 'effects/common/hue-rotate.hue_rotate' },
					{ name: 'Корекція кольорів…', target: 'image/color_corrections.color_corrections' },
					{ divider: true },
					{ name: 'Знебарвити', target: 'effects/common/grayscale.grayscale', shortcut: 'Ctrl+Shift+U' },
					{ name: 'Інверсія', target: 'effects/common/invert.invert', shortcut: 'Ctrl+I' },
					{ name: 'Сепія…', target: 'effects/common/sepia.sepia' },
				],
			},
			{ name: 'Автоматична корекція кольорів', target: 'image/auto_adjust.auto_adjust', shortcut: 'Ctrl+Shift+B' },
			{ divider: true },
			{ name: 'Розмір зображення…', target: 'image/resize.resize', shortcut: 'Ctrl+Alt+I' },
			{ name: 'Розмір полотна…', target: 'image/size.size', shortcut: 'Ctrl+Alt+C' },
			{ name: 'Обертання…', target: 'image/rotate.rotate' },
			{
				name: 'Відобразити',
				children: [
					{ name: 'По горизонталі', target: 'image/flip.horizontal' },
					{ name: 'По вертикалі', target: 'image/flip.vertical' },
				],
			},
			{ name: 'Обрізати прозорі краї', target: 'image/trim.trim' },
			{ divider: true },
			{ name: 'Гістограма…', target: 'image/histogram.histogram' },
			{ name: 'Відомості про зображення…', target: 'image/information.information' },
		],
	},
	{
		name: 'Шар',
		children: [
			{ name: 'Новий шар', target: 'layer/new.new', shortcut: 'Ctrl+Shift+N' },
			{ name: 'Дублювати шар', target: 'layer/duplicate.duplicate', shortcut: 'Ctrl+J' },
			{ name: 'Новий шар із виділеного', target: 'layer/new.new_selection', shortcut: 'Ctrl+Shift+J' },
			{ name: 'Видалити шар', target: 'layer/delete.delete' },
			{ name: 'Перейменувати шар…', target: 'layer/rename.rename' },
			{ name: 'Показати або сховати шар', target: 'layer/visibility.toggle' },
			{ divider: true },
			{
				name: 'Упорядкувати',
				children: [
					{ name: 'Перемістити вище', target: 'layer/move.up', shortcut: 'Ctrl+]' },
					{ name: 'Перемістити нижче', target: 'layer/move.down', shortcut: 'Ctrl+[' },
				],
			},
			{ name: 'Режим накладання…', target: 'layer/composition.composition' },
			{ divider: true },
			{ name: 'Раструвати шар', target: 'layer/raster.raster' },
			{ name: 'Очистити шар', target: 'layer/clear.clear' },
			{ divider: true },
			{ name: 'Об\'єднати з нижнім', target: 'layer/merge.merge', shortcut: 'Ctrl+E' },
			{ name: 'Звести всі шари', target: 'layer/flatten.flatten', shortcut: 'Ctrl+Shift+E' },
		],
	},
	{
		name: 'Виділення',
		children: [
			{ name: 'Усе', target: 'edit/selection.select_all', shortcut: 'Ctrl+A', native: true },
			{ name: 'Скасувати виділення', target: 'edu/commands.deselect', shortcut: 'Ctrl+D' },
		],
	},
	{
		name: 'Фільтр',
		children: [
			{ name: 'Галерея фільтрів…', target: 'effects/browser.browser' },
			{ divider: true },
			{
				name: 'Розмиття',
				children: [
					{ name: 'Розмиття за Гаусом…', target: 'effects/common/blur.blur' },
					{ name: 'Розмиття рамкою…', target: 'effects/box_blur.box_blur' },
					{ name: 'Розмиття з наближенням…', target: 'effects/zoom_blur.zoom_blur' },
					{ name: 'Ефект мініатюри (tilt-shift)…', target: 'effects/tilt_shift.tilt_shift' },
				],
			},
			{ name: 'Різкість…', target: 'effects/sharpen.sharpen' },
			{
				name: 'Шум',
				children: [
					{ name: 'Додати зерно…', target: 'effects/grains.grains' },
					{ name: 'Зменшити шум…', target: 'effects/denoise.denoise' },
				],
			},
			{
				name: 'Стилізація',
				children: [
					{ name: 'Тиснення…', target: 'effects/emboss.emboss' },
					{ name: 'Виділення країв…', target: 'effects/edge.edge' },
					{ name: 'Мозаїка…', target: 'effects/mosaic.mosaic' },
					{ name: 'Олійна фарба…', target: 'effects/oil.oil' },
					{ name: 'Малюнок олівцем', target: 'effects/pencil.pencil' },
					{ name: 'Соляризація', target: 'effects/solarize.solarize' },
				],
			},
			{ name: 'Віньєтка…', target: 'effects/vignette.vignette' },
			{ name: 'Тінь…', target: 'effects/common/shadow.shadow' },
			{ name: 'Рамка…', target: 'effects/borders.borders' },
		],
	},
	{
		name: 'Перегляд',
		children: [
			{ name: 'Збільшити', target: 'view/zoom.in', shortcut: 'Ctrl+=' },
			{ name: 'Зменшити', target: 'view/zoom.out', shortcut: 'Ctrl+-' },
			{ name: 'Умістити на екрані', target: 'view/zoom.auto', shortcut: 'Ctrl+0' },
			{ name: 'Реальний розмір (100%)', target: 'view/zoom.original', shortcut: 'Ctrl+1' },
			{ divider: true },
			{ name: 'Лінійки', target: 'view/ruler.ruler', shortcut: 'Ctrl+R' },
			{ name: 'Сітка', target: 'view/grid.grid', shortcut: 'Ctrl+\'' },
			{
				name: 'Напрямні',
				children: [
					{ name: 'Нова напрямна…', target: 'view/guides.insert' },
					{ name: 'Змінити напрямні…', target: 'view/guides.update' },
					{ name: 'Прибрати всі напрямні', target: 'view/guides.remove' },
				],
			},
		],
	},
	{
		name: 'Довідка',
		children: [
			{ name: 'Гарячі клавіші', target: 'help/shortcuts.shortcuts', shortcut: 'F1' },
			{ name: 'Про програму', target: 'help/about.about' },
		],
	},
];

export default menu;

/** Every command of the menu, depth first: `{ name, target, shortcut, native, path }`. */
export function menu_commands(items = menu, path = []) {
	const out = [];
	for (const item of items) {
		if (item.divider) continue;
		if (item.children) out.push(...menu_commands(item.children, [...path, item.name]));
		else if (item.target) out.push({ ...item, path: [...path, item.name] });
	}
	return out;
}
