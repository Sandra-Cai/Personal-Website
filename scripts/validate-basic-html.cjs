/**
 * CI helper: smoke-check key HTML pages for expected landmarks and structure.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');

function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}

function assertChecks(file, html, checks) {
  for (const [label, re] of checks) {
    if (!re.test(html)) {
      console.error(`validate-basic-html: ${file} missing expected: ${label}`);
      process.exit(1);
    }
  }
}

const checks404 = [
  ['doctype', /<!doctype html>/i],
  ['skip link', /class="ba-skip"/],
  ['main landmark', /\bid="main"/],
  ['404 block', /class="ba-404/],
  ['site stylesheet', /href="\/assets\/styles\.css\?v=/],
];

const checksIndex = [
  ['doctype', /<!doctype html>/i],
  ['skip link', /class="ba-skip"/],
  ['main landmark', /\bid="top"/],
  ['SandraGPT section', /\bid="sandra-gpt"/],
  ['JSON-LD Person', /"@type":\s*"Person"/],
  ['noscript fallback', /<noscript>/],
  ['site stylesheet', /href="\/assets\/styles\.css\?v=/],
  ['SandraGPT script', /src="\/assets\/sandra-gpt\.js\?v=/],
];

assertChecks('404.html', read('404.html'), checks404);
assertChecks('index.html', read('index.html'), checksIndex);

console.log('validate-basic-html: OK');
