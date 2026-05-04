/**
 * CI helper: smoke-check key HTML pages for expected landmarks and structure.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}

const checks404 = [
  ['doctype', /<!doctype html>/i],
  ['skip link', /class="ba-skip"/],
  ['main landmark', /\bid="main"/],
  ['404 block', /class="ba-404/],
  ['site stylesheet', /href="\/assets\/styles\.css\?v=/],
];

const html404 = read('404.html');
for (const [label, re] of checks404) {
  if (!re.test(html404)) {
    console.error(`validate-basic-html: 404.html missing expected: ${label}`);
    process.exit(1);
  }
}

console.log('validate-basic-html: OK');
