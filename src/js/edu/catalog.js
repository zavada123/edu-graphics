/**
 * EduProstir: all lessons of both editors, in the order of the textbook. The raster editor (index.html) and
 * the vector editor (vector.html) each run their own lessons; the lesson list and «Наступне завдання» go
 * through this catalog, so the student moves between the two editors without noticing it.
 */

import { lessons } from './lessons.js';
import { vector_lessons } from '../vector/lessons.js';

const by_passport = (list) => {
	const order = [...new Set(list.map((l) => l.passport))];
	return order.flatMap((p) => list.filter((l) => l.passport === p));
};

/** Lessons with a task by passport (raster first, then vector), free drawing last. */
export const catalog = [
	...by_passport([...lessons, ...vector_lessons].filter((l) => !l.free)),
	...lessons.filter((l) => l.free),
];

export const editor_of = (lesson) => lesson.editor ?? 'raster';

/** The page of the editor that runs the lesson, relative to the trainer folder. */
export const page_of = (lesson) => (editor_of(lesson) === 'vector' ? 'vector.html' : 'index.html');

export const catalog_lesson = (id) => catalog.find((l) => l.id === id);

/** The next lesson with a task after this one, in the catalog. */
export function next_of(lesson) {
	const next = catalog[catalog.indexOf(lesson) + 1];
	return next && !next.free ? next : undefined;
}
