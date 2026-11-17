/**
 * EduProstir, vector mode: lessons drawn in the SVG editor (SVG-Edit). The start is an SVG drawing with named
 * layers: the background sits on its own layer, so «Виділити все» takes only the shapes of the task.
 * Checks are the same as in the raster mode (checks.js); a shape has its name in `<title>`.
 */

const W = 800;
const H = 500;

const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** An SVG element with a name. */
const named = (tag, name, attrs) => {
	const list = Object.entries(attrs).map(([k, v]) => `${k}="${esc(v)}"`).join(' ');
	return `<${tag} ${list}><title>${esc(name)}</title></${tag}>`;
};

/** The drawing: layers bottom to top, the last one is where the student works. */
const drawing = (layers) => [
	`<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">`,
	...layers.map((l) => `<g class="layer"><title>${esc(l.name)}</title>${l.shapes.join('')}</g>`),
	'</svg>',
].join('');

const sky_and = (ground) => ({
	name: 'Тло',
	shapes: [
		named('rect', 'Небо', { x: 0, y: 0, width: W, height: H, fill: '#dbeafe' }),
		named('rect', 'Земля', { x: 0, y: 400, width: W, height: 100, fill: ground }),
	],
});

const SNOWBALL = { fill: '#ffffff', stroke: '#94a3b8', 'stroke-width': 3 };
const plank = (n, x, y) => named('rect', `Дошка ${n}`, { x, y, width: 50, height: 160, fill: '#a16207', stroke: '#713f12', 'stroke-width': 2 });

/** Tools of the left bar (SVG-Edit modes) that a lesson opens; the rest are hidden. */
export const VECTOR_TOOLS = ['select', 'zoom', 'fhpath', 'line', 'path', 'rect', 'square', 'fhrect', 'ellipse', 'circle', 'fhellipse', 'text'];

export const vector_lessons = [
	{
		id: 'inf6-10-ball',
		passport: 'inf6-10',
		grade: 6,
		editor: 'vector',
		title: 'Об\'ємний м\'ячик',
		task: [
			'М\'ячик для ярмарку плаский. Зроби його об\'ємним радіальним градієнтом.',
			'Вибери м\'ячик і клацни квадрат заливки на нижній панелі (ліворуч, біля відра з фарбою).',
			'Відкрий вкладку **Радіальний градієнт**. Під картинкою є дві краплі-повзунки: ліва — колір центру, права — колір краю.',
			'Двічі клацни ліву краплю й обери білий або світло-[yellow]жовтий[/yellow], **Гаразд**. Двічі клацни праву й обери [orange]помаранчевий[/orange] або [red]червоний[/red], **Гаразд**. Наприкінці — **Гаразд** у вікні заливки.',
		],
		manifest: { tools: ['select'] },
		start: { width: W, height: H, svg: drawing([
			sky_and('#86d06f'),
			{ name: 'М\'ячик', shapes: [named('circle', 'М\'ячик', { cx: 400, cy: 300, r: 90, fill: '#f97316', stroke: '#9a3412', 'stroke-width': 3 })] },
		]) },
		checks: [
			{ type: 'layers', match: { name: 'М\'ячик', gradient: 'radial' }, text: 'М\'ячик залито радіальним градієнтом', hint: 'У вікні заливки є вкладки **Суцільний**, **Лінійний градієнт** і **Радіальний градієнт**. Потрібна остання.' },
			{ type: 'layers', match: { name: 'М\'ячик', colors: [['white', 'yellow'], ['orange', 'red']] }, text: 'Від світлої плями до [orange]помаранчевого[/orange] краю', hint: 'Двічі клацни ліву краплю під смугою градієнта (центр) й обери білий або [yellow]жовтий[/yellow], а праву (край) — [orange]помаранчевий[/orange] або [red]червоний[/red].' },
		],
	},
	{
		id: 'inf6-10-drop',
		passport: 'inf6-10',
		grade: 6,
		editor: 'vector',
		title: 'Крапля з вузлів',
		task: [
			'Для емблеми потрібна крапля води, а є лише трикутник.',
			'Двічі клацни трикутник: з\'являться вузли — точки, через які йде контур.',
			'Клацни нижній лівий вузол і на верхній панелі в полі **Тип сегмента** обери **Крива**: нижній край стане кривою з двома круглими маркерами.',
			'Потягни маркери вниз, щоб низ краплі округлився. Так само вигни правий бік: клацни нижній правий вузол, **Крива** і потягни маркери.',
		],
		manifest: { tools: ['select'] },
		start: { width: W, height: H, svg: drawing([
			sky_and('#bae6fd'),
			{ name: 'Крапля', shapes: [named('path', 'Крапля', { d: 'M 400,80 L 520,340 L 280,340 Z', fill: '#3b82f6', stroke: '#1e3a8a', 'stroke-width': 3 })] },
		]) },
		checks: [
			{ type: 'layers', match: { type: 'path', name: 'Крапля', min_curves: 1 }, text: 'Один край краплі вигнуто', hint: 'Двічі клацни краплю, клацни нижній лівий вузол, обери **Крива** в полі **Тип сегмента** і потягни круглий маркер убік від краю.' },
			{ type: 'layers', match: { type: 'path', name: 'Крапля', min_curves: 2 }, text: 'Вигнуто два краї', hint: 'Сама **Крива** ще пряма: потягни її маркери. Потім зроби так само з іншим вузлом.' },
			{ type: 'layers', match: { type: 'path', name: 'Крапля', fill: 'blue' }, text: 'Крапля лишилася синьою', hint: 'Поверни краплі [blue]синю[/blue] заливку: вибери її і клацни [blue]синій[/blue] колір у палітрі внизу.' },
		],
	},
	{
		id: 'inf6-11-snowman',
		passport: 'inf6-11',
		grade: 6,
		editor: 'vector',
		title: 'Сніговик однією групою',
		task: [
			'Сніговик розсипався на три кулі. Збери його і зроби одним об\'єктом.',
			'Виділи три кулі ([k]Ctrl+A[/k] або клацання з Shift) і вирівняй їх **По центру** на верхній панелі.',
			'Згрупуй кулі ([k]Ctrl+G[/k] або кнопка **Групувати**): тепер вони рухаються разом.',
			'Перетягни сніговика-групу в праву половину аркуша.',
		],
		manifest: { tools: ['select'] },
		start: { width: W, height: H, svg: drawing([
			sky_and('#f8fafc'),
			{ name: 'Сніговик', shapes: [
				named('circle', 'Низ', { cx: 170, cy: 390, r: 70, ...SNOWBALL }),
				named('circle', 'Тулуб', { cx: 250, cy: 270, r: 52, ...SNOWBALL }),
				named('circle', 'Голова', { cx: 140, cy: 180, r: 36, ...SNOWBALL }),
			] },
		]) },
		checks: [
			{ type: 'aligned', match: { type: 'ellipse', fill: 'white' }, edge: 'center_x', min: 3, tolerance: 2, text: 'Кулі стоять одна над одною', hint: 'Виділи всі три кулі і на верхній панелі натисни **Вирівняти по центру**.' },
			{ type: 'group', members: { type: 'ellipse', fill: 'white' }, min: 3, text: 'Три кулі — одна група', hint: 'Виділи три кулі разом і натисни [k]Ctrl+G[/k] (**Групувати елементи**).' },
			{ type: 'inside', match: { type: 'group' }, area: { x: 420, y: 0, w: 380, h: 500 }, text: 'Сніговик стоїть праворуч', hint: 'Клацни сніговика: виділиться вся група. Перетягни її в праву половину аркуша.' },
		],
	},
	{
		id: 'inf6-11-fence',
		passport: 'inf6-11',
		grade: 6,
		editor: 'vector',
		title: 'Рівний паркан',
		task: [
			'Дошки паркану біля ярмарку стоять криво. Вирівняй їх кнопками, без перетягування.',
			'Виділи всі п\'ять дощок ([k]Ctrl+A[/k]).',
			'На верхній панелі натисни **Вирівняти низ**: дошки стануть на одну лінію.',
			'Натисни **Розподілити по горизонталі**: проміжки між дошками стануть однаковими.',
		],
		manifest: { tools: ['select'] },
		start: { width: W, height: H, svg: drawing([
			sky_and('#86d06f'),
			{ name: 'Паркан', shapes: [plank(1, 120, 250), plank(2, 230, 270), plank(3, 300, 240), plank(4, 470, 285), plank(5, 610, 260)] },
		]) },
		checks: [
			{ type: 'aligned', match: { type: 'rectangle', fill: 'brown' }, edge: 'bottom', min: 5, tolerance: 2, text: 'Дошки стоять на одній лінії', hint: 'Виділи всі дошки і натисни **Вирівняти низ** на верхній панелі.' },
			{ type: 'spaced', match: { type: 'rectangle', fill: 'brown' }, axis: 'x', min: 5, tolerance: 2, text: 'Проміжки між дошками однакові', hint: 'Виділи всі дошки і натисни **Розподілити по горизонталі**.' },
		],
	},
];
