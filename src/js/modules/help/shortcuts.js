import Dialog_class from './../../libs/popup.js';
// EduProstir: the trainer's keys (src/js/edu/keymap.js), only those the lesson opens.
import { shortcut_list } from './../../edu/keymap.js';
import { can_run, can_use_tool } from './../../edu/guard.js';

class Help_shortcuts_class {

	constructor() {
		this.POP = new Dialog_class();
	}

	//shortcuts
	shortcuts() {
		const { tools, commands } = shortcut_list();
		const params = [
			...tools.filter((t) => can_use_tool(t.tool)).map((t) => ({ title: t.keys, value: t.label })),
			...commands.filter((c) => can_run(c.target)).map((c) => ({ title: c.keys, value: c.label })),
			{ title: '[ і ]', value: 'Менший або більший пензель' },
			{ title: 'Esc', value: 'Зняти виділення, скасувати дію' },
			{ title: 'Коліщатко миші', value: 'Масштаб' },
		];
		this.POP.show({ title: 'Гарячі клавіші', className: 'shortcuts', params });
	}

}

export default Help_shortcuts_class;
