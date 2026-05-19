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
const indexHtml = read('index.html');
assertChecks('index.html', indexHtml, checksIndex);

const gptJs = read('assets/sandra-gpt.js');
const taglineJs = gptJs.match(/const TAGLINE = '([^']+)';/);
const taglineHtml = indexHtml.match(/id="gpt-tagline"[^>]*>([^<]+)</);
if (!taglineJs || !taglineHtml) {
  console.error('validate-basic-html: could not parse SandraGPT tagline in JS or index.html');
  process.exit(1);
}
if (taglineJs[1] !== taglineHtml[1].trim()) {
  console.error('validate-basic-html: gpt-tagline in index.html must match TAGLINE in sandra-gpt.js');
  console.error(`  index: ${taglineHtml[1].trim()}`);
  console.error(`  JS:    ${taglineJs[1]}`);
  process.exit(1);
}

const metaDesc = indexHtml.match(/<meta name="description" content="([^"]+)"/);
const jsonLd = indexHtml.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
if (!metaDesc || !jsonLd) {
  console.error('validate-basic-html: could not parse meta description or JSON-LD');
  process.exit(1);
}
let personDesc;
try {
  personDesc = JSON.parse(jsonLd[1]).description;
} catch {
  console.error('validate-basic-html: could not parse JSON-LD description');
  process.exit(1);
}
if (metaDesc[1] !== personDesc) {
  console.error('validate-basic-html: meta description must match JSON-LD Person.description');
  process.exit(1);
}

console.log('validate-basic-html: OK');
