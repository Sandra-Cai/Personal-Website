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
const plurall = graph.find((n) => n['@type'] === 'Organization' && n['@id'] === 'https://www.sandracai.com/#plurall');

if (!person) {
  console.error('validate-jsonld: missing Person node');
  process.exit(1);
}
if (!person.email || person.email !== 'sandraxcyj@gmail.com') {
  console.error('validate-jsonld: Person.email missing or incorrect');
  process.exit(1);
}
if (!person.worksFor || person.worksFor['@id'] !== 'https://www.sandracai.com/#plurall') {
  console.error('validate-jsonld: Person.worksFor must reference Plurall AI organization');
  process.exit(1);
}
if (!Array.isArray(person.knowsAbout) || person.knowsAbout.length < 3) {
  console.error('validate-jsonld: Person.knowsAbout must be an array with at least 3 topics');
  process.exit(1);
}
if (!person.alumniOf || person.alumniOf.name !== 'New York University') {
  console.error('validate-jsonld: Person.alumniOf must name New York University');
  process.exit(1);
}
if (!plurall || plurall.name !== 'Plurall AI') {
  console.error('validate-jsonld: missing Plurall AI Organization node');
  process.exit(1);
}
if (!plurall.founder || plurall.founder['@id'] !== 'https://www.sandracai.com/#person') {
  console.error('validate-jsonld: Plurall AI Organization.founder must reference Person');
  process.exit(1);
}
if (!plurall.description || !/deepfake detection/i.test(plurall.description)) {
  console.error('validate-jsonld: Plurall AI Organization.description missing or incorrect');
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
if (!person.description || !website.description || person.description !== website.description) {
  console.error('validate-jsonld: Person.description and WebSite.description must match');
  process.exit(1);
}

console.log('validate-jsonld: OK');
