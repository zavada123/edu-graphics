/**
 * EduProstir: exercises of grade 6 (Інформатика, розділ «Графічний редактор»), a story about the charity
 * fair of Taras and Myroslava. Each lesson: the starting picture, the tools it opens (policy.js) and the
 * conditions to check (checks.js).
 */

const W = 800;
const H = 500;

const SKY = '#bfe3ff';
const GRASS = '#86d06f';

/** A sky with a strip of grass, as one raster layer. */
const meadow = (ctx, w, h) => {
	ctx.fillStyle = SKY;
	ctx.fillRect(0, 0, w, h);
	ctx.fillStyle = GRASS;
	ctx.fillRect(0, h * 0.72, w, h * 0.28);
};

/** A house drawn with black lines on white: closed areas for the paint bucket. */
const house_outline = (ctx, w, h) => {
	ctx.fillStyle = '#ffffff';
	ctx.fillRect(0, 0, w, h);
	ctx.strokeStyle = '#1f2937';
	ctx.lineWidth = 6;
	ctx.lineJoin = 'round';
	// walls
	ctx.strokeRect(250, 230, 300, 210);
	// roof
	ctx.beginPath();
	ctx.moveTo(230, 230);
	ctx.lineTo(400, 90);
	ctx.lineTo(570, 230);
	ctx.closePath();
	ctx.stroke();
	// window
	ctx.strokeRect(300, 280, 80, 70);
	// door
	ctx.strokeRect(440, 320, 70, 120);
};

const flower = (name, x, y) => ({ kind: 'shape', type: 'star', name, x, y, w: 70, h: 70, corners: 6, inner_radius: 55, fill: '#ec4899', stroke: '#9d174d', stroke_size: 3 });

export const lessons = [
	{
		id: 'inf6-09-new-poster',
		passport: 'inf6-09',
		grade: 6,
		title: 'Новий аркуш для афіші',
		task: [
			'Тарас готує афішу ярмарку. Створи новий документ: меню «Файл → Створити…» (Ctrl+N).',
			'Задай розмір 800 × 600 пікселів.',
			'Інструментом «Заливка» (G) зафарбуй аркуш жовтим кольором. Колір обери на панелі «Кольори».',
		],
		manifest: { tools: ['fill', 'pick_color'], commands: ['file/new.new'], hidden: ['effects/*', 'image/*'] },
		start: { width: 640, height: 400, layers: [{ kind: 'fill', name: 'Тло', color: '#ffffff' }] },
		checks: [
			{ type: 'canvas', width: 800, height: 600, text: 'Аркуш має розмір 800 × 600 пікселів', hint: '«Файл → Створити…», ширина 800, висота 600.' },
			{ type: 'pixels', family: 'yellow', min_share: 0.9, text: 'Аркуш зафарбовано жовтим', hint: 'Обери жовтий колір на панелі «Кольори» і клацни по аркушу інструментом «Заливка».' },
		],
	},
	{
		id: 'inf6-09-house-fill',
		passport: 'inf6-09',
		grade: 6,
		title: 'Розфарбуй будиночок',
		task: [
			'Мирослава намалювала будиночок для ярмарку, але ще не розфарбувала.',
			'Інструментом «Заливка» (G) залий стіни жовтим кольором.',
			'Дах залий червоним кольором.',
		],
		manifest: { tools: ['fill', 'pick_color'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [{ kind: 'image', name: 'Будиночок', draw: house_outline }] },
		checks: [
			{ type: 'pixels', family: 'yellow', area: { x: 395, y: 245, w: 40, h: 60 }, min_share: 0.8, text: 'Стіни жовті', hint: 'Обери жовтий колір і клацни заливкою всередині стіни (не у вікні й не на дверях).' },
			{ type: 'pixels', family: 'red', area: { x: 370, y: 160, w: 60, h: 50 }, min_share: 0.8, text: 'Дах червоний', hint: 'Обери червоний колір і клацни заливкою всередині трикутника даху.' },
		],
	},
	{
		id: 'inf6-09-grass-brush',
		passport: 'inf6-09',
		grade: 6,
		title: 'Трава пензлем',
		task: [
			'На ярмарку буде галявина. Обери зелений колір на панелі «Кольори».',
			'Інструментом «Пензель» (B) намалюй траву внизу аркуша. Розмір пензля збільш до 20 і більше (клавіша ] або поле «Розмір»).',
			'Трава має вкрити більшу частину нижньої смуги аркуша.',
		],
		manifest: { tools: ['brush', 'pencil', 'erase', 'pick_color'], commands: ['layer/new.new'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'image', name: 'Небо', draw: (ctx, w, h) => { ctx.fillStyle = SKY; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, h * 0.8, w, h * 0.2); } },
			{ kind: 'image', name: 'Шар 1', draw: () => undefined },
		] },
		checks: [
			{ type: 'used', kind: 'tool', name: 'brush', text: 'Використано пензель', hint: 'Натисни B або вибери «Пензель» на панелі інструментів.' },
			{ type: 'pixels', family: 'green', area: { x: 0, y: 400, w: 800, h: 100 }, min_share: 0.5, text: 'Нижня смуга аркуша вкрита зеленою травою', hint: 'Зроби пензель ширшим і зафарбуй зеленим більшу частину білої смуги внизу.' },
		],
	},
	{
		id: 'inf6-09-flowerbed',
		passport: 'inf6-09',
		grade: 6,
		title: 'Клумба',
		task: [
			'Посеред галявини потрібна клумба.',
			'Інструментом «Фігури» (U) намалюй еліпс.',
			'У налаштуваннях фігури зроби контур червоним і товщиною 4 пікселі або більше, а заливку — зеленою.',
		],
		manifest: { tools: ['select', 'shape'], shapes: ['rectangle', 'ellipse'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [{ kind: 'image', name: 'Галявина', draw: meadow }] },
		checks: [
			{ type: 'layers', match: { type: 'ellipse', min_size: 40 }, text: 'На аркуші є еліпс', hint: 'Натисни U, обери «Еліпс» і протягни мишею по аркушу.' },
			{ type: 'layers', match: { type: 'ellipse', stroke: 'red', min_stroke: 4 }, text: 'Контур еліпса червоний, товщина від 4', hint: 'Вибери еліпс інструментом «Переміщення» (V) і зміни «Колір контуру» та «Товщину контуру» на панелі «Властивості шару».' },
			{ type: 'layers', match: { type: 'ellipse', fill: 'green' }, text: 'Заливка еліпса зелена', hint: 'Увімкни «Заливку» і обери зелений «Колір заливки».' },
		],
	},
	{
		id: 'inf6-09-sun-corner',
		passport: 'inf6-09',
		grade: 6,
		title: 'Сонце в куток',
		task: [
			'Сонце на афіші опинилося внизу ліворуч.',
			'Інструментом «Переміщення» (V) вибери шар «Сонце» і перетягни його в правий верхній кут.',
		],
		manifest: { tools: ['select'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'image', name: 'Небо', draw: (ctx, w, h) => { ctx.fillStyle = SKY; ctx.fillRect(0, 0, w, h); } },
			{ kind: 'shape', type: 'ellipse', name: 'Сонце', x: 60, y: 330, w: 110, h: 110, fill: '#facc15', stroke: '#f97316', stroke_size: 4 },
		] },
		checks: [
			{ type: 'pixels_center', family: 'yellow', area: { x: 560, y: 0, w: 240, h: 170 }, text: 'Сонце в правому верхньому куті', hint: 'Натисни V, наведи на сонце і перетягни його вгору праворуч.' },
		],
	},
	{
		id: 'inf6-09-export-web',
		passport: 'inf6-09',
		grade: 6,
		title: 'Афіша для сайту',
		file: 'afisha',
		task: [
			'Афіша готова, її треба викласти на сайт школи.',
			'Збережи її як звичайне зображення: «Файл → Експортувати як зображення…».',
			'Обери формат PNG або JPG. Формат JSON зберігає шари для подальшої роботи, але сайт його не покаже.',
		],
		manifest: { tools: ['select'], commands: ['file/save.save', 'file/save.export'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'fill', name: 'Тло', color: '#fef3c7' },
			{ kind: 'shape', type: 'star', name: 'Зірка', x: 80, y: 120, w: 160, h: 160, corners: 5, fill: '#facc15', stroke: '#f97316', stroke_size: 4 },
			{ kind: 'text', name: 'Назва', x: 280, y: 160, text: 'Ярмарок добра', size: 56, fill: '#b91c1c' },
			{ kind: 'text', name: 'Дата', x: 280, y: 250, text: 'Субота, 10:00', size: 32, fill: '#1f2937' },
		] },
		checks: [
			{ type: 'saved', formats: ['PNG', 'JPG'], text: 'Афішу збережено у форматі PNG або JPG', hint: '«Файл → Експортувати як зображення…», у полі типу обери PNG або JPG і натисни «OK».' },
		],
	},
	{
		id: 'inf6-10-star',
		passport: 'inf6-10',
		grade: 6,
		title: 'Зірка для логотипа',
		task: [
			'Ярмарку потрібен логотип — зірка.',
			'Інструментом «Фігури» (U) намалюй п\'ятикутну зірку.',
			'Зроби заливку жовтою, а контур помаранчевим.',
		],
		manifest: { tools: ['select', 'shape'], shapes: ['rectangle', 'ellipse', 'triangle', 'star', 'line'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [{ kind: 'fill', name: 'Тло', color: '#ffffff' }] },
		checks: [
			{ type: 'layers', match: { type: 'star', corners: 5, min_size: 40 }, text: 'На аркуші є п\'ятикутна зірка', hint: 'Натисни U, обери «Зірка», кількість кутів — 5.' },
			{ type: 'layers', match: { type: 'star', fill: 'yellow' }, text: 'Заливка зірки жовта', hint: 'Обери жовтий «Колір заливки».' },
			{ type: 'layers', match: { type: 'star', stroke: 'orange' }, text: 'Контур зірки помаранчевий', hint: 'Увімкни «Контур» і обери помаранчевий «Колір контуру».' },
		],
	},
	{
		id: 'inf6-10-recolor',
		passport: 'inf6-10',
		grade: 6,
		title: 'Перефарбуй зірку',
		task: [
			'Мирослава хоче червону зірку, а не жовту.',
			'Не малюй нову! Вибери готову зірку інструментом «Переміщення» (V) і зміни її колір заливки на червоний.',
			'У векторній фігурі колір — це налаштування, його можна змінити будь-коли.',
		],
		manifest: { tools: ['select', 'shape'], shapes: ['star'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'fill', name: 'Тло', color: '#ffffff' },
			{ kind: 'shape', type: 'star', name: 'Зірка', x: 300, y: 130, w: 220, h: 220, corners: 5, fill: '#facc15', stroke: '#f97316', stroke_size: 5 },
		] },
		checks: [
			{ type: 'recolored', name: 'Зірка', match: { fill: 'red' }, text: 'Та сама зірка тепер червона', hint: 'Вибери шар «Зірка» і на панелі «Властивості шару» зміни «Колір заливки» на червоний.' },
			{ type: 'layers', match: { type: 'star' }, min: 1, max: 1, text: 'На аркуші одна зірка', hint: 'Видали зайві зірки: вибери шар і натисни Delete.' },
		],
	},
	{
		id: 'inf6-11-sun-behind',
		passport: 'inf6-11',
		grade: 6,
		title: 'Сонце за горою',
		task: [
			'Сонце сходить з-за гори, але зараз воно намальоване поверх неї.',
			'Перемісти шар «Сонце» нижче за шар «Гора»: меню «Шар → Упорядкувати → Перемістити нижче» (Ctrl+[) або стрілки на панелі «Шари».',
			'Небо має залишитися найнижчим шаром.',
		],
		manifest: { tools: ['select'], commands: ['layer/move.*'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'image', name: 'Небо', draw: (ctx, w, h) => { ctx.fillStyle = SKY; ctx.fillRect(0, 0, w, h); } },
			{ kind: 'shape', type: 'triangle', name: 'Гора', x: 180, y: 160, w: 440, h: 340, fill: '#16a34a', stroke: '#14532d', stroke_size: 4 },
			{ kind: 'shape', type: 'ellipse', name: 'Сонце', x: 420, y: 110, w: 160, h: 160, fill: '#facc15', stroke: '#f97316', stroke_size: 4 },
		] },
		checks: [
			{ type: 'in_front', match: { name: 'Гора' }, behind: { name: 'Сонце' }, text: 'Гора закриває сонце', hint: 'Вибери шар «Сонце» і натисни Ctrl+[ або «Шар → Упорядкувати → Перемістити нижче».' },
			{ type: 'in_front', match: { name: 'Сонце' }, behind: { name: 'Небо' }, text: 'Сонце видно на небі', hint: 'Сонце опустилося нижче за небо: підніми його на один шар вище (Ctrl+]).' },
		],
	},
	{
		id: 'inf6-11-flowers-row',
		passport: 'inf6-11',
		grade: 6,
		title: 'Квіточки в ряд',
		task: [
			'Для орнаменту афіші квіточки треба розставити рівно.',
			'Вирівняй їх: верх усіх п\'яти квіточок на одній висоті (однакове значення Y на панелі «Властивості шару»).',
			'Розподіли їх: однакові проміжки між сусідніми квіточками (X: 100, 220, 340, 460, 580 — або свої, але рівні).',
		],
		manifest: { tools: ['select'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'fill', name: 'Тло', color: '#fff7ed' },
			flower('Квітка 1', 90, 210),
			flower('Квітка 2', 230, 250),
			flower('Квітка 3', 320, 190),
			flower('Квітка 4', 470, 280),
			flower('Квітка 5', 610, 230),
		] },
		checks: [
			{ type: 'aligned', match: { type: 'star' }, edge: 'top', min: 5, tolerance: 2, text: 'Квіточки стоять на одній висоті', hint: 'Вибери кожну квітку (V) і впиши однакове значення Y на панелі «Властивості шару».' },
			{ type: 'spaced', match: { type: 'star' }, axis: 'x', min: 5, tolerance: 2, text: 'Проміжки між квіточками однакові', hint: 'Задай X так, щоб різниця між сусідніми квітками була однаковою, наприклад 120.' },
		],
	},
	{
		id: 'inf6-11-title',
		passport: 'inf6-11',
		grade: 6,
		title: 'Напис над квітками',
		task: [
			'Над орнаментом потрібна назва ярмарку.',
			'Інструментом «Текст» (T) напиши «Ярмарок добра» вище за квіточки.',
			'Додай напису контур (обведення): у налаштуваннях тексту задай товщину контуру більшу за 0.',
		],
		manifest: { tools: ['select', 'text'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'fill', name: 'Тло', color: '#fff7ed' },
			flower('Квітка 1', 100, 330),
			flower('Квітка 2', 220, 330),
			flower('Квітка 3', 340, 330),
			flower('Квітка 4', 460, 330),
			flower('Квітка 5', 580, 330),
		] },
		checks: [
			{ type: 'layers', match: { type: 'text', text: 'Ярмарок добра' }, text: 'Є напис «Ярмарок добра»', hint: 'Натисни T, клацни на аркуші і набери текст без помилок.' },
			{ type: 'layers', match: { type: 'text', text: 'Ярмарок добра', min_stroke: 0.5 }, text: 'Напис має контур', hint: 'Вибери текст і задай «Товщину контуру» більшу за 0 у налаштуваннях тексту.' },
			{ type: 'above', match: { type: 'text', text: 'Ярмарок добра' }, over: { type: 'star' }, tolerance: 5, text: 'Напис вище за квіточки', hint: 'Перетягни напис інструментом «Переміщення» (V) у верхню частину аркуша.' },
		],
	},
	{
		id: 'free',
		passport: '',
		grade: 0,
		title: 'Вільне малювання',
		task: ['Усі інструменти відкриті. Малюй, що хочеш.'],
		manifest: { all: true },
		start: { width: W, height: H, layers: [{ kind: 'fill', name: 'Тло', color: '#ffffff' }] },
		checks: [],
		free: true,
	},
];

export const lesson_by_id = (id) => lessons.find((l) => l.id === id);
