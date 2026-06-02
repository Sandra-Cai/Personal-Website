/**
 * CI helper: ensure JSON-LD in index.html parses and includes key Person/WebSite fields.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const m = html.match(/<script type="application\/ld\+json">\s*([\s\S]*?)\s*<\/script>/);
if (!m) {
  console.error('validate-jsonld: no application/ld+json block found');
  process.exit(1);
}

let ld;
try {
  ld = JSON.parse(m[1]);
} catch (e) {
  console.error('validate-jsonld: invalid JSON in ld+json block:', e.message);
  process.exit(1);
}

const graph = ld['@graph'] || (ld['@type'] ? [ld] : []);
const person = graph.find((n) => n['@type'] === 'Person');
const website = graph.find((n) => n['@type'] === 'WebSite');

if (!person) {
  console.error('validate-jsonld: missing Person node');
  process.exit(1);
}
if (!person.email || person.email !== 'sandraxcyj@gmail.com') {
  console.error('validate-jsonld: Person.email missing or incorrect');
  process.exit(1);
}
if (!person.worksFor || person.worksFor.name !== 'Plurall AI') {
  console.error('validate-jsonld: Person.worksFor must name Plurall AI');
  process.exit(1);
}

if (!website) {
  console.error('validate-jsonld: missing WebSite node');
  process.exit(1);
}
if (website.inLanguage !== 'en-US') {
  console.error('validate-jsonld: WebSite.inLanguage must be en-US');
  process.exit(1);
}
if (!website.potentialAction || website.potentialAction['@type'] !== 'SearchAction') {
  console.error('validate-jsonld: WebSite.potentialAction SearchAction missing');
  process.exit(1);
}

console.log('validate-jsonld: OK');
