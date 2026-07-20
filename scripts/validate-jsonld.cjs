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
if (person.name !== 'Sandra Cai') {
  console.error('validate-jsonld: Person.name must be Sandra Cai');
  process.exit(1);
}
if (person.url !== 'https://www.sandracai.com') {
  console.error('validate-jsonld: Person.url must be https://www.sandracai.com');
  process.exit(1);
}
if (person['@id'] !== 'https://www.sandracai.com/#person') {
  console.error('validate-jsonld: Person.@id must be https://www.sandracai.com/#person');
  process.exit(1);
}
if (!person['@type'] || person['@type'] !== 'Person') {
  console.error('validate-jsonld: Person @type must be Person');
  process.exit(1);
}
if (!person.email || person.email !== 'sandraxcyj@gmail.com') {
  console.error('validate-jsonld: Person.email missing or incorrect');
  process.exit(1);
}
if (person.jobTitle !== 'Founder') {
  console.error('validate-jsonld: Person.jobTitle must be Founder');
  process.exit(1);
}
if (!person.alternateName || !/yijia/i.test(person.alternateName)) {
  console.error('validate-jsonld: Person.alternateName must include Yijia Sandra Cai');
  process.exit(1);
}
if (person.givenName !== 'Sandra' || person.familyName !== 'Cai') {
  console.error('validate-jsonld: Person.givenName/familyName must be Sandra Cai');
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
if (!person.knowsAbout.some((t) => /deepfake detection/i.test(t))) {
  console.error('validate-jsonld: Person.knowsAbout must include Deepfake detection');
  process.exit(1);
}
if (!person.knowsAbout.some((t) => /quantitative finance/i.test(t))) {
  console.error('validate-jsonld: Person.knowsAbout must include Quantitative finance');
  process.exit(1);
}
if (!person.knowsAbout.some((t) => /market microstructure/i.test(t))) {
  console.error('validate-jsonld: Person.knowsAbout must include Market microstructure');
  process.exit(1);
}
if (!person.knowsAbout.some((t) => /synthetic media/i.test(t))) {
  console.error('validate-jsonld: Person.knowsAbout must include Synthetic media');
  process.exit(1);
}
if (!person.knowsAbout.some((t) => /machine learning/i.test(t))) {
  console.error('validate-jsonld: Person.knowsAbout must include Machine learning');
  process.exit(1);
}
if (!person.knowsAbout.some((t) => /blockchain/i.test(t))) {
  console.error('validate-jsonld: Person.knowsAbout must include Blockchain');
  process.exit(1);
}
if (!person.knowsAbout.some((t) => /systems engineering/i.test(t))) {
  console.error('validate-jsonld: Person.knowsAbout must include Systems engineering');
  process.exit(1);
}
if (!person.image || !/sandra-headshot\.jpg/i.test(person.image)) {
  console.error('validate-jsonld: Person.image must reference sandra-headshot.jpg');
  process.exit(1);
}
if (person.image !== 'https://www.sandracai.com/assets/sandra-headshot.jpg') {
  console.error('validate-jsonld: Person.image must be https://www.sandracai.com/assets/sandra-headshot.jpg');
  process.exit(1);
}
if (!person.alumniOf || person.alumniOf.name !== 'New York University') {
  console.error('validate-jsonld: Person.alumniOf must name New York University');
  process.exit(1);
}
if (!person.alumniOf['@type'] || person.alumniOf['@type'] !== 'CollegeOrUniversity') {
  console.error('validate-jsonld: Person.alumniOf @type must be CollegeOrUniversity');
  process.exit(1);
}
const sameAs = Array.isArray(person.sameAs) ? person.sameAs : [];
if (!sameAs.some((u) => /github\.com\/Sandra-Cai/i.test(u))) {
  console.error('validate-jsonld: Person.sameAs must include GitHub profile');
  process.exit(1);
}
if (!sameAs.some((u) => /linkedin\.com\/in\/yijia-sandra-cai/i.test(u))) {
  console.error('validate-jsonld: Person.sameAs must include LinkedIn profile');
  process.exit(1);
}
if (!sameAs.some((u) => /substack\.com\/@caisandra/i.test(u))) {
  console.error('validate-jsonld: Person.sameAs must include Substack profile');
  process.exit(1);
}
if (!sameAs.some((u) => /medium\.com\/@caisandra/i.test(u))) {
  console.error('validate-jsonld: Person.sameAs must include Medium profile');
  process.exit(1);
}
const relMe = [...html.matchAll(/<link rel="me" href="([^"]+)"/g)].map((match) => match[1]);
for (const href of relMe) {
  if (!sameAs.includes(href)) {
    console.error(`validate-jsonld: rel=me href must appear in Person.sameAs: ${href}`);
    process.exit(1);
  }
}
if (!plurall || plurall.name !== 'Plurall AI') {
  console.error('validate-jsonld: missing Plurall AI Organization node');
  process.exit(1);
}
if (plurall['@id'] !== 'https://www.sandracai.com/#plurall') {
  console.error('validate-jsonld: Plurall AI Organization.@id must be https://www.sandracai.com/#plurall');
  process.exit(1);
}
if (!plurall.founder || plurall.founder['@id'] !== 'https://www.sandracai.com/#person') {
  console.error('validate-jsonld: Plurall AI Organization.founder must reference Person');
  process.exit(1);
}
if (!plurall.founder['@type'] || plurall.founder['@type'] !== 'Person') {
  console.error('validate-jsonld: Plurall AI Organization.founder @type must be Person');
  process.exit(1);
}
if (!plurall.description || !/deepfake detection/i.test(plurall.description)) {
  console.error('validate-jsonld: Plurall AI Organization.description missing or incorrect');
  process.exit(1);
}
if (!/synthetic-media trust/i.test(plurall.description)) {
  console.error('validate-jsonld: Plurall AI Organization.description must mention synthetic-media trust');
  process.exit(1);
}
if (plurall['@type'] !== 'Organization') {
  console.error('validate-jsonld: Plurall AI node @type must be Organization');
  process.exit(1);
}
if (!person.worksFor['@type'] || person.worksFor['@type'] !== 'Organization') {
  console.error('validate-jsonld: Person.worksFor @type must be Organization');
  process.exit(1);
}

if (!website) {
  console.error('validate-jsonld: missing WebSite node');
  process.exit(1);
}
if (website['@id'] !== 'https://www.sandracai.com/#website') {
  console.error('validate-jsonld: WebSite.@id must be https://www.sandracai.com/#website');
  process.exit(1);
}
if (website.url !== 'https://www.sandracai.com/') {
  console.error('validate-jsonld: WebSite.url must be https://www.sandracai.com/');
  process.exit(1);
}
if (website.name !== 'Sandra Cai') {
  console.error('validate-jsonld: WebSite.name must be Sandra Cai');
  process.exit(1);
}
if (website['@type'] !== 'WebSite') {
  console.error('validate-jsonld: WebSite @type must be WebSite');
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
const searchTarget = website.potentialAction.target;
if (!searchTarget || searchTarget['@type'] !== 'EntryPoint') {
  console.error('validate-jsonld: WebSite SearchAction target must be EntryPoint');
  process.exit(1);
}
if (searchTarget.urlTemplate !== 'https://www.sandracai.com/?q={search_term_string}') {
  console.error('validate-jsonld: WebSite SearchAction urlTemplate incorrect');
  process.exit(1);
}
if (website.potentialAction['query-input'] !== 'required name=search_term_string') {
  console.error('validate-jsonld: WebSite SearchAction query-input must be required name=search_term_string');
  process.exit(1);
}
if (!website.publisher || website.publisher['@id'] !== 'https://www.sandracai.com/#person') {
  console.error('validate-jsonld: WebSite.publisher must reference Person');
  process.exit(1);
}
if (!website.publisher['@type'] || website.publisher['@type'] !== 'Person') {
  console.error('validate-jsonld: WebSite.publisher @type must be Person');
  process.exit(1);
}
if (sameAs.length < 4) {
  console.error('validate-jsonld: Person.sameAs must include at least 4 profiles');
  process.exit(1);
}
if (!person.description || !website.description || person.description !== website.description) {
  console.error('validate-jsonld: Person.description and WebSite.description must match');
  process.exit(1);
}

console.log('validate-jsonld: OK');
