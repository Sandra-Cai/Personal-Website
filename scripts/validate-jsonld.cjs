/**
 * CI helper: ensure the first application/ld+json block in index.html parses as JSON.
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
try {
  JSON.parse(m[1]);
} catch (e) {
  console.error('validate-jsonld: invalid JSON in ld+json block:', e.message);
  process.exit(1);
}
console.log('validate-jsonld: OK');
