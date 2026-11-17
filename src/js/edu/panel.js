/**
 * EduProstir: the task card at the top of the right side bar: what to do, questions with a choice of answers,
 * «Перевірити», the result of each condition with a hint, «Наступне завдання» and «На весь екран».
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
			<select>${opts.lessons.map((l) => `<option value="${esc(l.id)}"${l.id === lesson.id ? ' selected' : ''}>${esc(l.title)}</option>`).join('')}</select>
		</label>`;

	root.innerHTML = `
		${picker}
		<div class="edu-task-head">
			<h2><button type="button" class="edu-fold" aria-expanded="true" title="Згорнути або розгорнути завдання">${esc(lesson.title)}</button></h2>
		</div>
		<ol class="edu-steps">${lesson.task.map((t) => `<li>${esc(t)}</li>`).join('')}</ol>
		${(lesson.questions ?? []).map((q) => `
			<fieldset class="edu-question" data-question="${esc(q.id)}">
				<legend>${esc(q.text)}</legend>
				${q.options.map((o, i) => `<label><input type="radio" name="edu_q_${esc(q.id)}" value="${i}"> <span>${esc(o)}</span></label>`).join('')}
			</fieldset>`).join('')}
		<div class="edu-actions">
			${lesson.free ? '' : '<button type="button" class="edu-check">Перевірити</button>'}
			<button type="button" class="edu-reset">Почати спочатку</button>
			${document.fullscreenEnabled ? '<button type="button" class="edu-full" aria-pressed="false">На весь екран</button>' : ''}
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

	const full = root.querySelector('.edu-full');
	if (full) {
		full.addEventListener('click', () => toggle_fullscreen());
		document.addEventListener('fullscreenchange', () => {
			const on = document.fullscreenElement !== null;
			full.textContent = on ? 'Вийти з повного екрана' : 'На весь екран';
			full.setAttribute('aria-pressed', String(on));
		});
	}

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

	/** The picked option of every answered question: { [question id]: option index }. */
	function answers() {
		const picked = {};
		for (const set of root.querySelectorAll('.edu-question')) {
			const input = set.querySelector('input:checked');
			if (input) picked[set.dataset.question] = Number(input.value);
		}
		return picked;
	}

	return { render_results, answers };
}

/**
 * Full screen, and in it the browser gives the page the keys it keeps for itself in a window (Ctrl+N, Ctrl+T,
 * Ctrl+W): Keyboard Lock, Chrome and Edge. Esc held for a moment leaves full screen.
 */
async function toggle_fullscreen() {
	if (document.fullscreenElement) {
		if (navigator.keyboard && navigator.keyboard.unlock) navigator.keyboard.unlock();
		await document.exitFullscreen();
		return;
	}
	try {
		await document.documentElement.requestFullscreen();
		if (navigator.keyboard && navigator.keyboard.lock) await navigator.keyboard.lock(['KeyN', 'KeyT', 'KeyW', 'KeyJ']);
	} catch {
		// Full screen is not allowed here (an iframe without allow="fullscreen"): the trainer works in the window.
	}
}
