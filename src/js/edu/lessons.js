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

/** A little "photo" of the fair: soft colours and blurred edges, made of pixels. */
const photo = (ctx) => {
	const x = 40, y = 70, w = 330, h = 360;
	ctx.save();
	ctx.beginPath();
	ctx.rect(x, y, w, h);
	ctx.clip();
	const sky = ctx.createLinearGradient(0, y, 0, y + h);
	sky.addColorStop(0, '#7dd3fc');
	sky.addColorStop(0.65, '#fde68a');
	ctx.fillStyle = sky;
	ctx.fillRect(x, y, w, h);
	const sun = ctx.createRadialGradient(x + 230, y + 110, 5, x + 230, y + 110, 70);
	sun.addColorStop(0, '#fff7ae');
	sun.addColorStop(0.45, '#fbbf24');
	sun.addColorStop(1, 'rgba(251, 191, 36, 0)');
	ctx.fillStyle = sun;
	ctx.fillRect(x, y, w, h);
	ctx.filter = 'blur(2px)';
	ctx.fillStyle = '#4d7c0f';
	ctx.beginPath();
	ctx.ellipse(x + 90, y + h, 200, 120, 0, 0, Math.PI * 2);
	ctx.fill();
	ctx.fillStyle = '#65a30d';
	ctx.beginPath();
	ctx.ellipse(x + 280, y + h + 20, 170, 110, 0, 0, Math.PI * 2);
	ctx.fill();
	// a tent of the fair
	ctx.fillStyle = '#dc2626';
	ctx.beginPath();
	ctx.moveTo(x + 120, y + 210);
	ctx.lineTo(x + 190, y + 290);
	ctx.lineTo(x + 50, y + 290);
	ctx.closePath();
	ctx.fill();
	ctx.restore();
	ctx.strokeStyle = '#1f2937';
	ctx.lineWidth = 3;
	ctx.strokeRect(x, y, w, h);
};

const photo_and_logo = { width: W, height: H, layers: [
	{ kind: 'fill', name: 'Тло', color: '#ffffff' },
	{ kind: 'image', name: 'Фото', draw: photo },
	{ kind: 'shape', type: 'star', name: 'Логотип', x: 470, y: 110, w: 260, h: 260, corners: 5, inner_radius: 45, fill: '#facc15', stroke: '#f97316', stroke_size: 6 },
] };

export const lessons = [
	{
		id: 'inf6-08-pixels',
		passport: 'inf6-08',
		grade: 6,
		title: 'Пікселі чи формули?',
		task: [
			'Мирослава принесла для афіші фото ярмарку (ліворуч) і логотип-зірку (праворуч).',
			'Збільш масштаб до 800 % або більше: [k]Ctrl+=[/k] кілька разів або коліщатко миші. Масштаб видно на панелі **Навігатор**.',
			'Роздивись край фото і край зірки. Відповідай на запитання нижче.',
		],
		manifest: { tools: ['select'], hidden: ['effects/*', 'image/*'] },
		start: photo_and_logo,
		questions: [
			{ id: 'photo', text: 'Із чого складається фото?', options: ['З формул: ліній і фігур', 'З маленьких квадратиків — пікселів', 'З літер і цифр'] },
			{ id: 'logo', text: 'Що сталося з краєм зірки при збільшенні?', options: ['Розпався на квадратики', 'Лишився рівним і гладким', 'Зник'] },
			{ id: 'kind', text: 'Яке зображення — растрове, а яке — векторне?', options: ['Фото растрове, зірка векторна', 'Фото векторне, зірка растрова', 'Обидва растрові'] },
		],
		checks: [
			{ type: 'zoom', min: 8, text: 'Малюнок збільшено до 800 % або більше', hint: 'Натискай [k]Ctrl+=[/k] або крути коліщатко миші над малюнком, доки на **Навігаторі** не буде 800 %.' },
			{ type: 'answer', question: 'photo', correct: 1, text: 'Фото складається з пікселів', hint: 'Подивись на край фото при великому масштабі: що ти бачиш?' },
			{ type: 'answer', question: 'logo', correct: 1, text: 'Край зірки лишився гладким', hint: 'Збільш зірку й подивись на її край: чи з\'явилися на ньому сходинки?' },
			{ type: 'answer', question: 'kind', correct: 0, text: 'Растр і вектор розпізнано правильно', hint: 'Растрове зображення складається з пікселів, векторне — з фігур, які програма перемальовує за формулами.' },
		],
	},
	{
		id: 'inf6-08-formats',
		passport: 'inf6-08',
		grade: 6,
		title: 'Який формат обрати?',
		task: [
			'Афішу ярмарку надрукують на великому білборді, а логотип — і на значку, і на банері.',
			'Подумай, у якому форматі зберегти кожне зображення. Можеш знову збільшити фото й логотип.',
			'Відповідай на запитання нижче.',
		],
		manifest: { tools: ['select'], hidden: ['effects/*', 'image/*'] },
		start: photo_and_logo,
		questions: [
			{ id: 'logo', text: 'Логотип будуть збільшувати й зменшувати. Який формат кращий?', options: ['JPG', 'SVG (векторний)', 'BMP'] },
			{ id: 'photo', text: 'Фото ярмарку для сайту. Який формат кращий?', options: ['JPG', 'SVG', 'TXT'] },
			{ id: 'svg', text: 'Мирослава зберегла фото у форматі SVG. Чи стало воно векторним?', options: ['Так, тепер його можна збільшувати без сходинок', 'Ні, всередині файлу лишилися ті самі пікселі', 'Так, але тільки кольори'] },
			{ id: 'layers', text: 'Афішу ще треба буде змінювати. Як зберегти її, щоб шари не злилися?', options: ['Як PNG', 'Як JPG', 'Як проєкт із шарами (JSON)'] },
		],
		checks: [
			{ type: 'answer', question: 'logo', correct: 1, text: 'Для логотипа обрано SVG', hint: 'Векторне зображення можна збільшувати без втрати якості. Який із форматів векторний?' },
			{ type: 'answer', question: 'photo', correct: 0, text: 'Для фото обрано JPG', hint: 'Фото — растрове зображення з плавними переходами кольорів. Для нього придумали стиснення JPG.' },
			{ type: 'answer', question: 'svg', correct: 1, text: 'Фото в SVG не стає векторним', hint: 'Програма не знає, з яких фігур складається фото: у SVG-файл вона просто вкладає ті самі пікселі.' },
			{ type: 'answer', question: 'layers', correct: 2, text: 'Афішу збережено з шарами', hint: 'PNG і JPG зливають усі шари в одну картинку. Шари зберігає лише проєкт (**Файл** → **Зберегти як проєкт**).' },
		],
	},
	{
		id: 'inf6-09-new-poster',
		passport: 'inf6-09',
		grade: 6,
		title: 'Новий аркуш для афіші',
		task: [
			'Тарас готує афішу ярмарку. Створи новий документ: меню **Файл** → **Створити…** ([k]Ctrl+N[/k]).',
			'Задай розмір 800 × 600 пікселів.',
			'Інструментом **Заливка** ([k]G[/k]) зафарбуй аркуш [yellow]жовтим[/yellow] кольором. Колір обери на панелі **Кольори**.',
		],
		manifest: { tools: ['fill', 'pick_color'], commands: ['file/new.new'], hidden: ['effects/*', 'image/*'] },
		start: { width: 640, height: 400, layers: [{ kind: 'fill', name: 'Тло', color: '#ffffff' }] },
		checks: [
			{ type: 'canvas', width: 800, height: 600, text: 'Аркуш має розмір 800 × 600 пікселів', hint: '**Файл** → **Створити…**, ширина 800, висота 600.' },
			{ type: 'pixels', family: 'yellow', min_share: 0.9, text: 'Аркуш зафарбовано [yellow]жовтим[/yellow]', hint: 'Обери [yellow]жовтий[/yellow] колір на панелі **Кольори** і клацни по аркушу інструментом **Заливка**.' },
		],
	},
	{
		id: 'inf6-09-house-fill',
		passport: 'inf6-09',
		grade: 6,
		title: 'Розфарбуй будиночок',
		task: [
			'Мирослава намалювала будиночок для ярмарку, але ще не розфарбувала.',
			'Інструментом **Заливка** ([k]G[/k]) залий стіни [yellow]жовтим[/yellow] кольором.',
			'Дах залий [red]червоним[/red] кольором.',
		],
		manifest: { tools: ['fill', 'pick_color'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [{ kind: 'image', name: 'Будиночок', draw: house_outline }] },
		checks: [
			{ type: 'pixels', family: 'yellow', area: { x: 395, y: 245, w: 40, h: 60 }, min_share: 0.8, text: 'Стіни [yellow]жовті[/yellow]', hint: 'Обери [yellow]жовтий[/yellow] колір і клацни заливкою всередині стіни (не у вікні й не на дверях).' },
			{ type: 'pixels', family: 'red', area: { x: 370, y: 160, w: 60, h: 50 }, min_share: 0.8, text: 'Дах [red]червоний[/red]', hint: 'Обери [red]червоний[/red] колір і клацни заливкою всередині трикутника даху.' },
		],
	},
	{
		id: 'inf6-09-grass-brush',
		passport: 'inf6-09',
		grade: 6,
		title: 'Трава пензлем',
		task: [
			'На ярмарку буде галявина. Обери [green]зелений[/green] колір на панелі **Кольори**.',
			'Інструментом **Пензель** ([k]B[/k]) намалюй траву внизу аркуша. Розмір пензля збільш до 20 і більше (клавіша [k]][/k] або поле **Розмір**).',
			'Трава має вкрити більшу частину нижньої смуги аркуша.',
		],
		manifest: { tools: ['brush', 'pencil', 'erase', 'pick_color'], commands: ['layer/new.new'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'image', name: 'Небо', draw: (ctx, w, h) => { ctx.fillStyle = SKY; ctx.fillRect(0, 0, w, h); ctx.fillStyle = '#ffffff'; ctx.fillRect(0, h * 0.8, w, h * 0.2); } },
			{ kind: 'image', name: 'Шар 1', draw: () => undefined },
		] },
		checks: [
			{ type: 'used', kind: 'tool', name: 'brush', text: 'Використано пензель', hint: 'Натисни [k]B[/k] або вибери **Пензель** на панелі інструментів.' },
			{ type: 'pixels', family: 'green', area: { x: 0, y: 400, w: 800, h: 100 }, min_share: 0.5, text: 'Нижня смуга аркуша вкрита [green]зеленою[/green] травою', hint: 'Зроби пензель ширшим і зафарбуй [green]зеленим[/green] більшу частину білої смуги внизу.' },
		],
	},
	{
		id: 'inf6-09-flowerbed',
		passport: 'inf6-09',
		grade: 6,
		title: 'Клумба',
		task: [
			'Посеред галявини потрібна клумба.',
			'Інструментом **Фігури** ([k]U[/k]) намалюй еліпс.',
			'У налаштуваннях фігури зроби контур [red]червоним[/red] і товщиною 4 пікселі або більше, а заливку — [green]зеленою[/green].',
		],
		manifest: { tools: ['select', 'shape'], shapes: ['rectangle', 'ellipse'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [{ kind: 'image', name: 'Галявина', draw: meadow }] },
		checks: [
			{ type: 'layers', match: { type: 'ellipse', min_size: 40 }, text: 'На аркуші є еліпс', hint: 'Натисни [k]U[/k], обери **Еліпс** і протягни мишею по аркушу.' },
			{ type: 'layers', match: { type: 'ellipse', stroke: 'red', min_stroke: 4 }, text: 'Контур еліпса [red]червоний[/red], товщина від 4', hint: 'Вибери еліпс інструментом **Переміщення** ([k]V[/k]) і зміни **Колір контуру** та **Товщину контуру** на панелі **Властивості шару**.' },
			{ type: 'layers', match: { type: 'ellipse', fill: 'green' }, text: 'Заливка еліпса [green]зелена[/green]', hint: 'Увімкни **Заливку** і обери [green]зелений[/green] **Колір заливки**.' },
		],
	},
	{
		id: 'inf6-09-sun-corner',
		passport: 'inf6-09',
		grade: 6,
		title: 'Сонце в куток',
		task: [
			'Сонце на афіші опинилося внизу ліворуч.',
			'Інструментом **Переміщення** ([k]V[/k]) вибери шар «Сонце» і перетягни його в правий верхній кут.',
		],
		manifest: { tools: ['select'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'image', name: 'Небо', draw: (ctx, w, h) => { ctx.fillStyle = SKY; ctx.fillRect(0, 0, w, h); } },
			{ kind: 'shape', type: 'ellipse', name: 'Сонце', x: 60, y: 330, w: 110, h: 110, fill: '#facc15', stroke: '#f97316', stroke_size: 4 },
		] },
		checks: [
			{ type: 'pixels_center', family: 'yellow', area: { x: 560, y: 0, w: 240, h: 170 }, text: 'Сонце в правому верхньому куті', hint: 'Натисни [k]V[/k], наведи на сонце і перетягни його вгору праворуч.' },
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
			'Збережи її як звичайне зображення: **Файл** → **Експортувати як зображення…**.',
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
			{ type: 'saved', formats: ['PNG', 'JPG'], text: 'Афішу збережено у форматі PNG або JPG', hint: '**Файл** → **Експортувати як зображення…**, у полі типу обери PNG або JPG і натисни **OK**.' },
		],
	},
	{
		id: 'inf6-10-star',
		passport: 'inf6-10',
		grade: 6,
		title: 'Зірка для логотипа',
		task: [
			'Ярмарку потрібен логотип — зірка.',
			'Інструментом **Фігури** ([k]U[/k]) намалюй п\'ятикутну зірку.',
			'Зроби заливку [yellow]жовтою[/yellow], а контур [orange]помаранчевим[/orange].',
		],
		manifest: { tools: ['select', 'shape'], shapes: ['rectangle', 'ellipse', 'triangle', 'star', 'line'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [{ kind: 'fill', name: 'Тло', color: '#ffffff' }] },
		checks: [
			{ type: 'layers', match: { type: 'star', corners: 5, min_size: 40 }, text: 'На аркуші є п\'ятикутна зірка', hint: 'Натисни [k]U[/k], обери **Зірка**, кількість кутів — 5.' },
			{ type: 'layers', match: { type: 'star', fill: 'yellow' }, text: 'Заливка зірки [yellow]жовта[/yellow]', hint: 'Обери [yellow]жовтий[/yellow] **Колір заливки**.' },
			{ type: 'layers', match: { type: 'star', stroke: 'orange' }, text: 'Контур зірки [orange]помаранчевий[/orange]', hint: 'Увімкни **Контур** і обери [orange]помаранчевий[/orange] **Колір контуру**.' },
		],
	},
	{
		id: 'inf6-10-recolor',
		passport: 'inf6-10',
		grade: 6,
		title: 'Перефарбуй зірку',
		task: [
			'Мирослава хоче [red]червону[/red] зірку, а не [yellow]жовту[/yellow].',
			'Не малюй нову! Вибери готову зірку інструментом **Переміщення** ([k]V[/k]) і зміни її колір заливки на [red]червоний[/red].',
			'У векторній фігурі колір — це налаштування, його можна змінити будь-коли.',
		],
		manifest: { tools: ['select', 'shape'], shapes: ['star'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'fill', name: 'Тло', color: '#ffffff' },
			{ kind: 'shape', type: 'star', name: 'Зірка', x: 300, y: 130, w: 220, h: 220, corners: 5, fill: '#facc15', stroke: '#f97316', stroke_size: 5 },
		] },
		checks: [
			{ type: 'recolored', name: 'Зірка', match: { fill: 'red' }, text: 'Та сама зірка тепер [red]червона[/red]', hint: 'Вибери шар «Зірка» і на панелі **Властивості шару** зміни **Колір заливки** на [red]червоний[/red].' },
			{ type: 'layers', match: { type: 'star' }, min: 1, max: 1, text: 'На аркуші одна зірка', hint: 'Видали зайві зірки: вибери шар і натисни [k]Delete[/k].' },
		],
	},
	{
		id: 'inf6-10-sunset',
		passport: 'inf6-10',
		grade: 6,
		title: 'Небо на заході сонця',
		task: [
			'Тарас хоче, щоб небо над горою світилося, як на заході сонця.',
			'Візьми **Градієнт** ([k]G[/k]). На панелі параметрів задай перший колір [yellow]жовтий[/yellow] або [orange]помаранчевий[/orange], другий — [blue]синій[/blue] або [purple]фіолетовий[/purple].',
			'Протягни мишею по аркушу знизу вгору. Градієнт стане новим шаром.',
			'Новий шар закрив гору: перемісти його нижче ([k]Ctrl+[[/k]), щоб гора була попереду.',
		],
		manifest: { tools: ['gradient', 'select'], commands: ['layer/move.*'], hidden: ['effects/*', 'image/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'fill', name: 'Небо', color: '#ffffff' },
			{ kind: 'shape', type: 'triangle', name: 'Гора', x: 120, y: 200, w: 560, h: 300, fill: '#334155', stroke: '#1e293b', stroke_size: 4 },
		] },
		checks: [
			{ type: 'layers', match: { type: 'gradient', colors: [['yellow', 'orange', 'red'], ['blue', 'purple']] }, text: 'Небо — градієнт від теплого кольору до [blue]синього[/blue]', hint: 'Інструментом **Градієнт** ([k]G[/k]) задай кольори: один [yellow]жовтий[/yellow] або [orange]помаранчевий[/orange], другий [blue]синій[/blue] або [purple]фіолетовий[/purple], і протягни мишею.' },
			{ type: 'in_front', match: { name: 'Гора' }, behind: { type: 'gradient' }, text: 'Гора попереду неба', hint: 'Шар градієнта лежить зверху. Вибери його і натисни [k]Ctrl+[[/k] (**Шар** → **Упорядкувати** → **Перемістити нижче**).' },
		],
	},
	{
		id: 'inf6-10-rainbow',
		passport: 'inf6-10',
		grade: 6,
		title: 'Веселка кривою',
		task: [
			'Над галявиною має бути веселка — плавна дуга, а не ламана.',
			'Відкрий **Фігури** ([k]U[/k]) і вибери **Крива (перо)**. Колір — [red]червоний[/red], товщина на панелі параметрів — 8 або більше.',
			'Натисни на лівому кінці дуги й потягни вгору: з\'явиться перша напрямна. Потім натисни на правому кінці й теж потягни вгору.',
			'Якщо дуга не вдалася, інструментом **Переміщення** ([k]V[/k]) перетягни кінці напрямних.',
		],
		manifest: { tools: ['select', 'shape'], shapes: ['bezier_curve'], hidden: ['effects/*', 'image/*'] },
		start: { width: W, height: H, layers: [{ kind: 'image', name: 'Галявина', draw: meadow }] },
		checks: [
			{ type: 'curve', match: { stroke: 'red' }, min_span: 300, text: 'Червона крива від краю до краю галявини', hint: 'Кінці кривої мають стояти далеко один від одного: від лівого до правого краю галявини.' },
			{ type: 'curve', match: { stroke: 'red' }, min_span: 300, min_bend: 60, bend: 'up', text: 'Крива вигнута дугою вгору', hint: 'Потягни обидві напрямні вгору: середина дуги має піднятися над кінцями.' },
			{ type: 'curve', match: { stroke: 'red', min_stroke: 8 }, text: 'Дуга товста, як веселка', hint: 'Задай товщину 8 або більше на панелі параметрів перед малюванням.' },
		],
	},
	{
		id: 'inf6-11-sun-behind',
		passport: 'inf6-11',
		grade: 6,
		title: 'Сонце за горою',
		task: [
			'Сонце сходить з-за гори, але зараз воно намальоване поверх неї.',
			'Перемісти шар «Сонце» нижче за шар «Гора»: меню **Шар** → **Упорядкувати** → **Перемістити нижче** ([k]Ctrl+[[/k]) або стрілки на панелі **Шари**.',
			'Шар «Небо» має залишитися найнижчим.',
		],
		manifest: { tools: ['select'], commands: ['layer/move.*'], hidden: ['effects/*'] },
		start: { width: W, height: H, layers: [
			{ kind: 'image', name: 'Небо', draw: (ctx, w, h) => { ctx.fillStyle = SKY; ctx.fillRect(0, 0, w, h); } },
			{ kind: 'shape', type: 'triangle', name: 'Гора', x: 180, y: 160, w: 440, h: 340, fill: '#16a34a', stroke: '#14532d', stroke_size: 4 },
			{ kind: 'shape', type: 'ellipse', name: 'Сонце', x: 420, y: 110, w: 160, h: 160, fill: '#facc15', stroke: '#f97316', stroke_size: 4 },
		] },
		checks: [
			{ type: 'in_front', match: { name: 'Гора' }, behind: { name: 'Сонце' }, text: '«Гора» закриває «Сонце»', hint: 'Вибери шар «Сонце» і натисни [k]Ctrl+[[/k] або **Шар** → **Упорядкувати** → **Перемістити нижче**.' },
			{ type: 'in_front', match: { name: 'Сонце' }, behind: { name: 'Небо' }, text: '«Сонце» видно на небі', hint: '«Сонце» опустилося нижче за «Небо»: підніми його на один шар вище ([k]Ctrl+][/k]).' },
		],
	},
	{
		id: 'inf6-11-flowers-row',
		passport: 'inf6-11',
		grade: 6,
		title: 'Квіточки в ряд',
		task: [
			'Для орнаменту афіші квіточки треба розставити рівно.',
			'Вирівняй їх: верх усіх п\'яти квіточок на одній висоті (однакове значення Y на панелі **Властивості шару**).',
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
			{ type: 'aligned', match: { type: 'star' }, edge: 'top', min: 5, tolerance: 2, text: 'Квіточки стоять на одній висоті', hint: 'Вибери кожну квітку ([k]V[/k]) і впиши однакове значення Y на панелі **Властивості шару**.' },
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
			'Інструментом **Текст** ([k]T[/k]) напиши «Ярмарок добра» вище за квіточки.',
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
			{ type: 'layers', match: { type: 'text', text: 'Ярмарок добра' }, text: 'Є напис «Ярмарок добра»', hint: 'Натисни [k]T[/k], клацни на аркуші і набери текст без помилок.' },
			{ type: 'layers', match: { type: 'text', text: 'Ярмарок добра', min_stroke: 0.5 }, text: 'Напис має контур', hint: 'Вибери текст і задай **Товщину контуру** більшу за 0 у налаштуваннях тексту.' },
			{ type: 'above', match: { type: 'text', text: 'Ярмарок добра' }, over: { type: 'star' }, tolerance: 5, text: 'Напис вище за квіточки', hint: 'Перетягни напис інструментом **Переміщення** ([k]V[/k]) у верхню частину аркуша.' },
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
