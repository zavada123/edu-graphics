// Packs the built trainer into lib/ for sites that install edu-graphics as a package (EduProstir, mriya-study):
// `npm run lib` = webpack build + this script. lib/ is committed, so the package needs no build on install.
//
// lib/index.html, lib/dist/bundle.js, lib/images/  the raster editor, served from any folder (all paths are relative)
// lib/vector.html, lib/dist/vector.js, lib/svgedit/ the vector mode on SVG-Edit (MIT), with lib/components/ of it
// lib/lessons.json                                 the lesson list for a catalog page: id, passport, grade, editor,
//                                                  title, task; both pages open any lesson (?lesson=<id>)
import fs from 'node:fs';
import path from 'node:path';
import { catalog, editor_of } from '../src/js/edu/catalog.js';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const lib = path.join(root, 'lib');

fs.rmSync(lib, { recursive: true, force: true });
fs.mkdirSync(path.join(lib, 'dist'), { recursive: true });
for (const file of ['index.html', 'vector.html', 'dist/bundle.js', 'dist/bundle.js.LICENSE.txt', 'dist/vector.js', 'dist/vector.js.LICENSE.txt']) {
	fs.copyFileSync(path.join(root, file), path.join(lib, file));
}
fs.mkdirSync(path.join(lib, 'images'));
for (const name of ['edu-icon.svg', 'icons', 'eye.svg']) {
	fs.cpSync(path.join(root, 'images', name), path.join(lib, 'images', name), { recursive: true });
}
for (const dir of ['svgedit', 'components']) fs.cpSync(path.join(root, dir), path.join(lib, dir), { recursive: true });

const list = catalog.map((l) => ({ id: l.id, passport: l.passport, grade: l.grade, editor: editor_of(l), title: l.title, task: l.task }));
fs.writeFileSync(path.join(lib, 'lessons.json'), JSON.stringify(list, null, '\t') + '\n');
console.log(`lib/: ${list.length} lessons`);
