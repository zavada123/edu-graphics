/**
 * EduProstir: the task card at the top of the right side bar: what to do, «Перевірити», the result of each
 * condition with a hint, and «Наступне завдання».
 */

const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', '\'': '&#39;' })[c]);

/**
 * @param {HTMLElement} host
 * @param {{ lesson: object, lessons: object[], embedded: boolean, on_check: () => Promise<object[]>,
 *   on_reset: () => void, on_pick: (id: string) => void, next: object | undefined }} opts
 */
export function mount_panel(host, opts) {
	const { lesson } = opts;
	const root = document.createElement('section');
	root.className = 'edu-task block';
	root.id = 'edu_task';
	root.setAttribute('aria-label', 'Завдання');

	const picker = opts.embedded ? '' : `
		<label class="edu-pick">
			<span class="sr_only">Завдання</span>
			<select>${opts.lessons.map((l) => `<option value="${esc(l.id)}"${l.id === lesson.id ? ' selected' : ''}>${esc(l.grade > 0 ? l.grade + ' клас · ' : '')}${esc(l.title)}</option>`).join('')}</select>
		</label>`;

	root.innerHTML = `
		${picker}
		<div class="edu-task-head">
			${lesson.grade > 0 ? `<span class="edu-grade">${lesson.grade} клас</span>` : ''}
			<h2><button type="button" class="edu-fold" aria-expanded="true" title="Згорнути або розгорнути завдання">${esc(lesson.title)}</button></h2>
		</div>
		<ol class="edu-steps">${lesson.task.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
		<div class="edu-actions">
			${lesson.free ? '' : '<button type="button" class="edu-check">Перевірити</button>'}
			<button type="button" class="edu-reset">Почати спочатку</button>
		</div>
		<div class="edu-results" role="status" aria-live="polite"></div>`;
	host.prepend(root);

	const results_node = root.querySelector('.edu-results');
	const fold = root.querySelector('.edu-fold');
	fold.addEventListener('click', () => {
		const open = root.classList.toggle('is-folded') === false;
		fold.setAttribute('aria-expanded', String(open));
	});
	const select = root.querySelector('.edu-pick select');
	if (select) select.addEventListener('change', () => opts.on_pick(select.value));
	root.querySelector('.edu-reset').addEventListener('click', () => opts.on_reset());

	const check = root.querySelector('.edu-check');
	if (check) {
		check.addEventListener('click', async () => {
			check.disabled = true;
			try {
				render_results(await opts.on_check());
			} finally {
				check.disabled = false;
			}
		});
	}

	function render_results(results) {
		const done = results.filter((r) => r.ok).length;
		const solved = results.length > 0 && done === results.length;
		results_node.className = 'edu-results' + (solved ? ' is-solved' : '');
		results_node.innerHTML = `
			<p class="edu-results-head">${solved ? '🎉 Молодець! Усе виконано.' : `Виконано ${done} з ${results.length}`}</p>
			<ul>${results.map((r) => `
				<li class="${r.ok ? 'is-ok' : 'is-bad'}">
					<span aria-hidden="true">${r.ok ? '✅' : '❌'}</span> ${esc(r.text)}
					${r.ok ? '' : `<small>${esc(r.hint)}</small>`}
				</li>`).join('')}
			</ul>
			${solved && opts.next ? `<button type="button" class="edu-next"><span>Наступне завдання →</span><small>${esc(opts.next.title)}</small></button>` : ''}`;
		const next = results_node.querySelector('.edu-next');
		if (next) next.addEventListener('click', () => opts.on_pick(opts.next.id));
	}

	return { render_results };
}
