// Packs the built trainer into lib/ for sites that install edu-graphics as a package (EduProstir, mriya-study):
// `npm run lib` = webpack build + this script. lib/ is committed, so the package needs no build on install.
//
// lib/index.html, lib/dist/bundle.js, lib/images/  the trainer, served from any folder (all paths are relative)
// lib/lessons.json                                 the lesson list for a catalog page: id, passport, grade, title, task
import fs from 'node:fs';
import path from 'node:path';
import { lessons } from '../src/js/edu/lessons.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const lib = path.join(root, 'lib');

fs.rmSync(lib, { recursive: true, force: true });
fs.mkdirSync(path.join(lib, 'dist'), { recursive: true });
fs.copyFileSync(path.join(root, 'index.html'), path.join(lib, 'index.html'));
fs.copyFileSync(path.join(root, 'dist/bundle.js'), path.join(lib, 'dist/bundle.js'));
fs.copyFileSync(path.join(root, 'dist/bundle.js.LICENSE.txt'), path.join(lib, 'dist/bundle.js.LICENSE.txt'));
fs.mkdirSync(path.join(lib, 'images'));
for (const name of ['edu-icon.svg', 'icons']) {
	fs.cpSync(path.join(root, 'images', name), path.join(lib, 'images', name), { recursive: true });
}

const list = lessons.map((l) => ({ id: l.id, passport: l.passport, grade: l.grade, title: l.title, task: l.task }));
fs.writeFileSync(path.join(lib, 'lessons.json'), JSON.stringify(list, null, '\t') + '\n');
console.log(`lib/: ${list.length} lessons`);
