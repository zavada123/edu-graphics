import Dialog_class from './../../libs/popup.js';

class Help_about_class {

	constructor() {
		this.POP = new Dialog_class();
	}

	//about
	about() {
		// EduProstir: the trainer, with credit to the editor it is built on (MIT licence).
		var settings = {
			title: 'Про програму',
			params: [
				{title: "Назва:", html: '<span class="about-name">Графічний редактор EduProstir</span>'},
				{title: "Версія:", value: VERSION},
				{title: "Опис:", value: "Навчальний тренажер графічного редактора для уроків інформатики."},
				{title: "Основа:", html: 'miniPaint, автор ViliusL, ліцензія MIT: <a href="https://github.com/viliusle/miniPaint" target="_blank" rel="noopener">github.com/viliusle/miniPaint</a>'},
				{title: "Код:", html: '<a href="https://github.com/zavada123/edu-graphics" target="_blank" rel="noopener">github.com/zavada123/edu-graphics</a>'},
			],
		};
		this.POP.show(settings);
	}

}

export default Help_about_class;
