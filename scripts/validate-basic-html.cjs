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
  ['html lang en', /<html lang="en">/],
  ['skip link', /class="ba-skip"/],
  ['main landmark', /\bid="main"/],
  ['404 block', /class="ba-404/],
  ['404 sandragpt link', /href="\/#sandra-gpt"/],
  ['404 robots noindex', /<meta name="robots" content="noindex"/],
  ['404 footer home', /ba-footer-links[\s\S]*?<a href="\/">Home<\/a>/],
  ['site stylesheet', /href="\/assets\/styles\.css\?v=/],
  ['nav separator', /class="ba-nav-sep"/],
  ['nav external class', /class="ba-nav-external"/],
  ['logo aria-label', /class="ba-logo"[^>]*aria-label=/],
  ['footer Substack', /ba-footer-links[\s\S]*?substack\.com/i],
  ['footer Medium', /ba-footer-links[\s\S]*?medium\.com/i],
  ['footer GitHub', /ba-footer-links[\s\S]*?github\.com/i],
  ['manifest link', /rel="manifest"/],
  ['404 canonical', /<link rel="canonical" href="https:\/\/www\.sandracai\.com\/"/],
  ['referrer policy', /<meta name="referrer" content="strict-origin-when-cross-origin"/],
  ['color-scheme light', /<meta name="color-scheme" content="light"/],
  ['theme-color', /<meta name="theme-color" content="#FFFDF7"/],
  ['404 email lead', /ba-404-lead[\s\S]*?sandraxcyj@gmail\.com/],
  ['404 skip main', /class="ba-skip" href="#main"/],
];

const checksIndex = [
  ['doctype', /<!doctype html>/i],
  ['html lang en', /<html lang="en">/],
  ['skip link', /class="ba-skip"/],
  ['main landmark', /\bid="top"/],
  ['SandraGPT section', /\bid="sandra-gpt"/],
  ['canonical', /<link rel="canonical" href="https:\/\/www\.sandracai\.com\/"/],
  ['rel me github', /<link rel="me" href="https:\/\/github\.com\/Sandra-Cai"/],
  ['rel me linkedin', /<link rel="me" href="https:\/\/www\.linkedin\.com\/in\/yijia-sandra-cai"/],
  ['rel me substack', /<link rel="me" href="https:\/\/substack\.com\/@caisandra"/],
  ['rel me medium', /<link rel="me" href="https:\/\/medium\.com\/@caisandra"/],
  ['meta author', /<meta name="author" content="Sandra Cai"/],
  ['referrer policy', /<meta name="referrer" content="strict-origin-when-cross-origin"/],
  ['JSON-LD graph', /"@graph"/],
  ['JSON-LD Person', /"@type":\s*"Person"/],
  ['JSON-LD email', /"email":\s*"sandraxcyj@gmail.com"/],
  ['JSON-LD WebSite SearchAction', /"urlTemplate":\s*"https:\/\/www\.sandracai\.com\/\?q=\{search_term_string\}"/],
  ['noscript fallback', /<noscript>/],
  ['site stylesheet', /href="\/assets\/styles\.css\?v=/],
  ['SandraGPT script', /src="\/assets\/sandra-gpt\.js\?v=/],
  ['manifest link', /rel="manifest"/],
  ['connector aside', /<aside class="ba-strip" aria-label="Connector">/],
  ['external links nav', /<nav class="ba-strip ba-strip--dim" aria-label="External links">/],
  ['JSON-LD inLanguage', /"inLanguage":\s*"en-US"/],
  ['JSON-LD Plurall org', /"@id":\s*"https:\/\/www\.sandracai\.com\/#plurall"/],
  ['JSON-LD worksFor org', /"worksFor":\s*\{\s*"@type":\s*"Organization"/],
  ['meta 4+ years', /4\+ years across industry, research, and founding/],
  ['og locale', /property="og:locale" content="en_US"/],
  ['color-scheme light', /<meta name="color-scheme" content="light"/],
  ['theme-color', /<meta name="theme-color" content="#FFFDF7"/],
  ['gpt maxlength 280', /id="gpt-input"[^>]*maxlength="280"/],
  ['send disabled by default', /class="gpt-send"[^>]*disabled/],
  ['footer GitHub', /ba-footer-links[\s\S]*?github\.com/i],
  ['theorem github link', /Theorem of Wisdom[\s\S]*?href="https:\/\/github\.com\/Sandra-Cai\/Bayes-Theorem"/],
  ['inside the ban github link', /Inside the Ban[\s\S]*?href="https:\/\/github\.com\/Sandra-Cai\/Jane-Street-India-Ban-Analysis"/],
  ['inside the ban linkedin', /Inside the Ban[\s\S]*?linkedin\.com\/posts\/yijia-sandra-cai_quantfinance-derivatives-marketmicrostructure/],
  ['theorem linkedin', /Theorem of Wisdom[\s\S]*?linkedin\.com\/posts\/yijia-sandra-cai_bayesian-decisionmaking-opensource/],
  ['avav perplexity link', /AVAV investment thesis[\s\S]*?perplexity\.ai\/computer\/a\/avav-investment-thesis/],
  ['hero eyebrow 4+ years', /class="ba-eyebrow"[^>]*>[^<]*4\+ years/],
  ['medium oscar link', /AI &amp; macro \(Medium\)[\s\S]*?medium\.com\/@caisandra\/oscar-should-be-given-to-ai/],
  ['medium hawkish link', /AI &amp; macro \(Medium\)[\s\S]*?medium\.com\/@caisandra\/hawkish-v-s-dovish/],
  ['duke scoreboard link', /Trading[\s\S]*?fintechtradingcompetition\.com\/articles\/scoreboard\.html/],
  ['hero lead 4+ years', /class="ba-lead"[^>]*>[\s\S]*?<strong>4\+ years<\/strong>/],
  ['gpt starter inside the ban', /class="gpt-starter"[^>]*data-q="Inside the Ban"/],
  ['gpt starter theorem', /class="gpt-starter"[^>]*data-q="Theorem of Wisdom"/],
  ['gpt starter plurall', /class="gpt-starter"[^>]*data-q="What is Plurall AI\?"/],
  ['academic nyu cs', /id="education"[\s\S]*?<strong>NYU CS<\/strong>/],
  ['phoenix trading mention', /Phoenix Trading Competition/],
  ['hero student nyu', /class="ba-student-note"[^>]*>[\s\S]*?NYU CS/],
  ['gpt starter duke fintech', /class="gpt-starter"[^>]*data-q="Duke Fintech"/],
  ['work vigil markets', /id="work"[\s\S]*?Vigil Markets/],
  ['founding pennapps', /Plurall AI &amp; product[\s\S]*?PennApps/],
  ['beliefs show the work', /id="beliefs"[\s\S]*?Show the work/],
  ['connector strip', /aria-label="Connector"[\s\S]*?one discipline/],
  ['JSON-LD alternateName', /"alternateName":\s*"Yijia Sandra Cai"/],
  ['hero mission plurall', /class="ba-mission"[^>]*>[\s\S]*?Plurall AI/],
  ['academic bemt minor', /id="education"[\s\S]*?<strong>BEMT<\/strong>/],
  ['institutional msra jd', /Research &amp; cloud[\s\S]*?Microsoft Research Asia[\s\S]*?JD\.com/],
  ['gpt starter what do you do', /class="gpt-starter"[^>]*data-q="What do you do\?"/],
  ['gpt placeholder', /id="gpt-input"[^>]*placeholder="Ask about Plurall, work, research/],
  ['hero focus areas', /class="ba-focus"[^>]*>[\s\S]*?Markets &amp; quant/],
  ['academic math minor', /id="education"[\s\S]*?<strong>Mathematics<\/strong>/],
  ['og image alt plurall', /property="og:image:alt" content="[^"]*Plurall AI/],
  ['gpt slash shortcut', /id="gpt-input"[^>]*aria-keyshortcuts="\/"/],
  ['beliefs systems incentives', /id="beliefs"[\s\S]*?Systems and incentives/],
  ['beliefs ship iterate', /id="beliefs"[\s\S]*?Ship and iterate/],
  ['perspective rigor copy', /id="perspective"[\s\S]*?assumptions you can defend/],
  ['gpt disclaimer not live model', /id="gpt-disclaimer"[^>]*>[\s\S]*?not a live model/],
  ['work accel title', /id="accel-title"[^>]*>Accelerating work that ships/],
  ['JSON-LD person id', /"@id":\s*"https:\/\/www\.sandracai\.com\/#person"/],
  ['research section title', /id="research-title"[^>]*>Independent research/],
  ['academic title', /id="edu-title"[^>]*>Academic/],
  ['beliefs title', /id="beliefs-title"[^>]*>Three things I believe/],
  ['hero mission ai-native', /class="ba-mission"[^>]*>[\s\S]*?AI-native world/],
  ['JSON-LD website id', /"@id":\s*"https:\/\/www\.sandracai\.com\/#website"/],
  ['gpt tagline trading comps', /id="gpt-tagline"[^>]*>[\s\S]*?trading comps/],
  ['gpt heading', /id="gpt-heading"[^>]*>Ask what you want to know/],
  ['perspective rigor split', /id="perspective"[\s\S]*?Rigor as[\s\S]*?infrastructure/],
  ['quant card title', /id="work"[\s\S]*?Markets &amp; crypto infrastructure/],
  ['gpt kicker', /class="ba-kicker"[^>]*>SandraGPT/],
  ['founding deepfake', /ba-card--lead[\s\S]*?deepfake detection/],
  ['external strip email', /aria-label="External links"[\s\S]*?sandraxcyj@gmail\.com/],
  ['hero eyebrow founding', /class="ba-eyebrow"[^>]*>[^<]*industry, research/],
  ['JSON-LD jobTitle', /"jobTitle":\s*"Founder"/],
  ['JSON-LD givenName', /"givenName":\s*"Sandra"/],
  ['work deck pipelines', /id="work"[\s\S]*?quant pipelines/],
  ['founding phase', /ba-card--lead[\s\S]*?ba-phase">Founding/],
  ['footer email', /ba-footer-links[\s\S]*?mailto:sandraxcyj@gmail\.com/],
  ['page title plurall', /<title>Sandra Cai · Founder, Plurall AI<\/title>/],
  ['JSON-LD familyName', /"familyName":\s*"Cai"/],
  ['institutional phase', /id="work"[\s\S]*?ba-phase">Institutional/],
  ['hero student technical', /class="ba-student-note"[^>]*>[\s\S]*?Technical education/],
  ['research deck substack', /id="research"[\s\S]*?essays on[\s\S]*?substack\.com/],
  ['quant phase', /id="work"[\s\S]*?ba-phase">Quant/],
  ['beliefs path wrong', /id="beliefs"[\s\S]*?path to being wrong/],
  ['hero focus ai trust', /class="ba-focus"[^>]*>[\s\S]*?AI &amp; trust/],
  ['og canonical url', /property="og:url" content="https:\/\/www\.sandracai\.com\/"/],
  ['twitter card', /name="twitter:card" content="summary_large_image"/],
  ['og type website', /property="og:type" content="website"/],
  ['academic coursework ml', /id="education"[\s\S]*?algorithms through ML/],
  ['founding card title', /ba-card--lead[\s\S]*?Plurall AI &amp; product/],
  ['404 footer linkedin', /ba-footer-links[\s\S]*?linkedin\.com\/in\/yijia-sandra-cai/],
  ['og image dimensions', /property="og:image:width" content="1200"[\s\S]*?property="og:image:height" content="630"/],
  ['research synthetic media', /id="research"[\s\S]*?synthetic-media trust/],
  ['beliefs microstructure', /id="beliefs"[\s\S]*?Microstructure, risk/],
  ['gpt sidebar history', /class="gpt-sidebar-title"[^>]*>History/],
  ['nav writing substack', /class="ba-nav-external"[^>]*href="https:\/\/substack\.com\/@caisandra"/],
  ['JSON-LD person url', /"url":\s*"https:\/\/www\.sandracai\.com"/],
  ['gpt char count', /id="gpt-char-count"[^>]*aria-live="polite"/],
  ['gpt log region', /id="gpt-log"[^>]*role="log"/],
  ['gpt input describedby', /id="gpt-input"[^>]*aria-describedby="gpt-disclaimer gpt-char-count"/],
  ['skip link top', /class="ba-skip" href="#top"/],
  ['gpt form aria-busy', /id="gpt-form"[^>]*aria-busy="false"/],
  ['gpt sync status', /id="gpt-sync-status"[^>]*role="status"/],
  ['gpt clear history', /id="gpt-clear-history"[^>]*aria-label="Clear question history"/],
  ['external strip writing', /aria-label="External links"[\s\S]*?ba-strip-label">Writing/],
  ['og image social card', /property="og:image" content="[^"]*social-card\.jpg"/],
  ['meta viewport', /<meta name="viewport" content="width=device-width, initial-scale=1"/],
  ['gpt enterkeyhint', /id="gpt-input"[^>]*enterkeyhint="send"/],
  ['nav github', /class="ba-nav-external"[^>]*href="https:\/\/github\.com\/Sandra-Cai"/],
  ['logo aria home', /class="ba-logo"[^>]*aria-label="Sandra Cai, home"/],
  ['gpt starters label', /class="gpt-starters"[^>]*aria-label="Example questions"/],
  ['external strip code', /aria-label="External links"[\s\S]*?ba-strip-label">Code/],
  ['external strip contact', /aria-label="External links"[\s\S]*?ba-strip-label">Contact/],
  ['beliefs stress test', /id="beliefs"[\s\S]*?stress-test research/],
  ['nav track record', /class="ba-nav"[\s\S]*?href="#work">Track record/],
  ['nav research', /class="ba-nav"[\s\S]*?href="#research">Research/],
  ['nav academic', /class="ba-nav"[\s\S]*?href="#education">Academic/],
  ['gpt disclaimer mailto', /id="gpt-disclaimer"[^>]*>[\s\S]*?mailto:sandraxcyj@gmail\.com/],
  ['nav sandragpt', /class="ba-nav"[\s\S]*?href="#sandra-gpt">SandraGPT/],
  ['gpt sidebar aria', /class="gpt-sidebar"[^>]*aria-label="Question history"/],
  ['footer contentinfo', /<footer class="ba-footer" role="contentinfo"/],
  ['external strip contact email', /aria-label="External links"[\s\S]*?ba-strip-label">Contact[\s\S]*?sandraxcyj@gmail\.com/],
  ['connector strip text', /aria-label="Connector"[\s\S]*?class="ba-strip-text"/],
];

const html404 = read('404.html');
assertChecks('404.html', html404, checks404);
const indexHtml = read('index.html');
assertChecks('index.html', indexHtml, checksIndex);

const indexCssV = indexHtml.match(/href="\/assets\/styles\.css\?v=(\d+)"/);
const css404V = html404.match(/href="\/assets\/styles\.css\?v=(\d+)"/);
if (!indexCssV || !css404V) {
  console.error('validate-basic-html: could not parse styles.css cache version');
  process.exit(1);
}
if (indexCssV[1] !== css404V[1]) {
  console.error('validate-basic-html: index.html and 404.html styles.css cache versions must match');
  process.exit(1);
}

const indexScriptV = indexHtml.match(/src="\/assets\/script\.js\?v=(\d+)"/);
const script404V = html404.match(/src="\/assets\/script\.js\?v=(\d+)"/);
if (!indexScriptV || !script404V) {
  console.error('validate-basic-html: could not parse script.js cache version');
  process.exit(1);
}
if (indexScriptV[1] !== script404V[1]) {
  console.error('validate-basic-html: index.html and 404.html script.js cache versions must match');
  process.exit(1);
}

const indexGptV = indexHtml.match(/src="\/assets\/sandra-gpt\.js\?v=(\d+)"/);
if (!indexGptV) {
  console.error('validate-basic-html: could not parse sandra-gpt.js cache version');
  process.exit(1);
}

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
function personDescriptionFromLd(ld) {
  if (ld['@graph']) {
    const person = ld['@graph'].find((n) => n['@type'] === 'Person');
    return person?.description;
  }
  if (ld['@type'] === 'Person') return ld.description;
  return undefined;
}

let personDesc;
try {
  personDesc = personDescriptionFromLd(JSON.parse(jsonLd[1]));
} catch {
  console.error('validate-basic-html: could not parse JSON-LD description');
  process.exit(1);
}
if (!personDesc) {
  console.error('validate-basic-html: JSON-LD Person.description missing');
  process.exit(1);
}
if (metaDesc[1] !== personDesc) {
  console.error('validate-basic-html: meta description must match JSON-LD Person.description');
  process.exit(1);
}

const ogDesc = indexHtml.match(/<meta property="og:description" content="([^"]+)"/);
const twDesc = indexHtml.match(/<meta name="twitter:description" content="([^"]+)"/);
if (!ogDesc || !twDesc) {
  console.error('validate-basic-html: could not parse og:description or twitter:description');
  process.exit(1);
}
if (metaDesc[1] !== ogDesc[1] || metaDesc[1] !== twDesc[1]) {
  console.error('validate-basic-html: meta, og, and twitter descriptions must match');
  process.exit(1);
}

const ogImageAlt = indexHtml.match(/<meta property="og:image:alt" content="([^"]+)"/);
const twImageAlt = indexHtml.match(/<meta name="twitter:image:alt" content="([^"]+)"/);
if (!ogImageAlt || !twImageAlt) {
  console.error('validate-basic-html: could not parse og:image:alt or twitter:image:alt');
  process.exit(1);
}
if (ogImageAlt[1] !== twImageAlt[1]) {
  console.error('validate-basic-html: og:image:alt and twitter:image:alt must match');
  process.exit(1);
}
if (!/Plurall AI/i.test(ogImageAlt[1])) {
  console.error('validate-basic-html: og:image:alt must mention Plurall AI');
  process.exit(1);
}

const ogImage = indexHtml.match(/<meta property="og:image" content="([^"]+)"/);
const twImage = indexHtml.match(/<meta name="twitter:image" content="([^"]+)"/);
if (!ogImage || !twImage) {
  console.error('validate-basic-html: could not parse og:image or twitter:image');
  process.exit(1);
}
if (ogImage[1] !== twImage[1]) {
  console.error('validate-basic-html: og:image and twitter:image must match');
  process.exit(1);
}

const ogImageSecure = indexHtml.match(/<meta property="og:image:secure_url" content="([^"]+)"/);
if (!ogImageSecure) {
  console.error('validate-basic-html: could not parse og:image:secure_url');
  process.exit(1);
}
if (ogImage[1] !== ogImageSecure[1]) {
  console.error('validate-basic-html: og:image and og:image:secure_url must match');
  process.exit(1);
}

const pageTitle = indexHtml.match(/<title>([^<]+)<\/title>/);
const ogTitle = indexHtml.match(/<meta property="og:title" content="([^"]+)"/);
const twTitle = indexHtml.match(/<meta name="twitter:title" content="([^"]+)"/);
if (!pageTitle || !ogTitle || !twTitle) {
  console.error('validate-basic-html: could not parse page or social titles');
  process.exit(1);
}
if (pageTitle[1] !== ogTitle[1] || pageTitle[1] !== twTitle[1]) {
  console.error('validate-basic-html: title, og:title, and twitter:title must match');
  process.exit(1);
}

const ogSiteName = indexHtml.match(/<meta property="og:site_name" content="([^"]+)"/);
if (!ogSiteName) {
  console.error('validate-basic-html: could not parse og:site_name');
  process.exit(1);
}
if (ogSiteName[1] !== 'Sandra Cai') {
  console.error('validate-basic-html: og:site_name must be Sandra Cai');
  process.exit(1);
}

const metaAuthor = indexHtml.match(/<meta name="author" content="([^"]+)"/);
if (!metaAuthor) {
  console.error('validate-basic-html: could not parse meta author');
  process.exit(1);
}
if (metaAuthor[1] !== ogSiteName[1]) {
  console.error('validate-basic-html: meta author must match og:site_name');
  process.exit(1);
}

const canonical = indexHtml.match(/<link rel="canonical" href="([^"]+)"/);
const ogUrl = indexHtml.match(/<meta property="og:url" content="([^"]+)"/);
if (!canonical || !ogUrl) {
  console.error('validate-basic-html: could not parse canonical or og:url');
  process.exit(1);
}
if (canonical[1] !== ogUrl[1]) {
  console.error('validate-basic-html: canonical href must match og:url');
  process.exit(1);
}

const ogLocale = indexHtml.match(/<meta property="og:locale" content="([^"]+)"/);
if (!ogLocale || ogLocale[1] !== 'en_US') {
  console.error('validate-basic-html: og:locale must be en_US');
  process.exit(1);
}

const ogImageType = indexHtml.match(/<meta property="og:image:type" content="([^"]+)"/);
if (!ogImageType || ogImageType[1] !== 'image/jpeg') {
  console.error('validate-basic-html: og:image:type must be image/jpeg');
  process.exit(1);
}

function assertBlankLinksLabeled(file, html) {
  const tags = html.match(/<a\b[^>]*\btarget="_blank"[^>]*>/gi) || [];
  for (const tag of tags) {
    if (!/\baria-label=/.test(tag)) {
      console.error(`validate-basic-html: ${file} has target="_blank" without aria-label: ${tag.slice(0, 120)}`);
      process.exit(1);
    }
    if (!/\brel="noopener noreferrer"/.test(tag)) {
      console.error(`validate-basic-html: ${file} has target="_blank" without rel="noopener noreferrer": ${tag.slice(0, 120)}`);
      process.exit(1);
    }
  }
}

assertBlankLinksLabeled('index.html', indexHtml);
assertBlankLinksLabeled('404.html', read('404.html'));

const maxQ = gptJs.match(/const MAX_QUESTION_CHARS = (\d+);/);
if (!maxQ || maxQ[1] !== '280') {
  console.error('validate-basic-html: MAX_QUESTION_CHARS in sandra-gpt.js must be 280');
  process.exit(1);
}

console.log('validate-basic-html: OK');
