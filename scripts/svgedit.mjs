// Copies the ready SVG-Edit editor (npm package svgedit, MIT) to svgedit/ for vector.html: the vector mode
// loads it as a module from there (src/js/vector/main.js). Source maps, the IIFE build, tests and demo pages
// are left out. Runs before every build.
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const from = path.join(root, 'node_modules/svgedit/dist/editor');
const to = path.join(root, 'svgedit');
const skip = /\.map$|[\\/]iife-|[\\/]tests([\\/]|$)|\.html$/;

fs.rmSync(to, { recursive: true, force: true });
fs.cpSync(from, to, { recursive: true, filter: (src) => !skip.test(src) });
fs.copyFileSync(path.join(root, 'node_modules/svgedit/LICENSE-MIT.txt'), path.join(to, 'LICENSE-MIT.txt'));
// A few pictures of SVG-Edit are taken next to the page, not from imgPath: the eye of the layers panel and
// the colour maps of the fill dialog (jGraduate).
fs.copyFileSync(path.join(from, 'images/eye.svg'), path.join(root, 'images/eye.svg'));
fs.rmSync(path.join(root, 'components'), { recursive: true, force: true });
fs.cpSync(path.join(from, 'components/jgraduate/images'), path.join(root, 'components/jgraduate/images'), { recursive: true });
const { version } = JSON.parse(fs.readFileSync(path.join(root, 'node_modules/svgedit/package.json'), 'utf8'));
console.log(`svgedit/: SVG-Edit ${version}`);
