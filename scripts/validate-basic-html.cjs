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
  ['html lang en-US', /<html lang="en-US">/],
  ['skip link', /class="ba-skip"/],
  ['main landmark', /\bid="main"/],
  ['404 main focusable', /<main id="main" tabindex="-1">/],
  ['404 title focusable', /class="ba-404-title"[^>]*tabindex="-1"/],
  ['404 block', /class="ba-404/],
  ['404 sandragpt link', /href="\/#sandra-gpt"/],
  ['404 robots noindex', /<meta name="robots" content="noindex, nofollow"/],
  ['404 viewport-fit cover', /<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/],
  ['404 footer home', /ba-footer-links[\s\S]*?<a href="\/" aria-label="Home page">Home<\/a>/],
  ['site stylesheet', /href="\/assets\/styles\.css\?v=/],
  ['nav separator', /class="ba-nav-sep"/],
  ['nav external class', /class="ba-nav-external"/],
  ['logo aria-label', /class="ba-logo"[^>]*aria-label=/],
  ['footer Substack', /ba-footer-links[\s\S]*?substack\.com/i],
  ['footer Medium', /ba-footer-links[\s\S]*?medium\.com/i],
  ['footer GitHub', /ba-footer-links[\s\S]*?github\.com/i],
  ['manifest link', /rel="manifest"/],
  ['referrer policy', /<meta name="referrer" content="strict-origin-when-cross-origin"/],
  ['color-scheme light dark', /<meta name="color-scheme" content="light dark"/],
  ['theme-color', /<meta name="theme-color" content="#FFFDF7"/],
  ['theme boot', /src="\/assets\/theme-boot\.js\?v=\d+"/],
  ['theme toggle', /id="theme-toggle"[^>]*class="ba-theme-toggle"|class="ba-theme-toggle"[^>]*id="theme-toggle"/],
  ['404 email lead', /ba-404-lead[\s\S]*?sandraxcyj@gmail\.com/],
  ['404 home aria-label', /ba-404-lead[\s\S]*?href="\/" aria-label="Back to home page"/],
  ['404 sandragpt aria-label', /ba-404-lead[\s\S]*?href="\/#sandra-gpt" aria-label="SandraGPT on home page"/],
  ['404 email aria-label', /ba-404-lead[\s\S]*?aria-label="Email Sandra Cai"/],
  ['404 skip main', /class="ba-skip" href="#main"/],
  ['404 nav github', /class="ba-nav-external"[^>]*href="https:\/\/github\.com\/Sandra-Cai"/],
  ['404 logo home', /class="ba-logo"[^>]*aria-label="Sandra Cai, home"/],
  ['404 footer contentinfo', /<footer class="ba-footer" role="contentinfo"/],
  ['404 script cache', /src="\/assets\/script\.js\?v=\d+" defer/],
  ['404 year fallback', /id="year">2026<\/span>/],
  ['404 email footer', /ba-footer-links[\s\S]*?mailto:sandraxcyj@gmail\.com[^>]*aria-label="Email Sandra Cai"/],
  ['404 favicon ico', /rel="icon"[^>]*favicon\.ico/],
  ['404 writing nav', /class="ba-nav-external"[^>]*href="https:\/\/substack\.com\/@caisandra"/],
  ['404 primary nav', /<nav class="ba-nav" aria-label="Primary">/],
  ['404 color-scheme light dark', /<meta name="color-scheme" content="light dark"/],
  ['404 theme boot', /src="\/assets\/theme-boot\.js\?v=\d+"/],
  ['404 theme toggle', /id="theme-toggle"/],
  ['404 font preload crossorigin', /rel="preload"[^>]*Geist-Variable\.woff2[^>]*crossorigin/],
  ['404 apple-touch sizes', /rel="apple-touch-icon"[^>]*sizes="180x180"[^>]*apple-touch-icon\.png/],
];

const checksIndex = [
  ['doctype', /<!doctype html>/i],
  ['html lang en-US', /<html lang="en-US">/],
  ['skip link', /class="ba-skip"/],
  ['main landmark', /\bid="top"/],
  ['main focusable', /<main id="top" tabindex="-1">/],
  ['SandraGPT section', /\bid="sandra-gpt"/],
  ['canonical', /<link rel="canonical" href="https:\/\/www\.sandracai\.com\/"/],
  ['sitemap link', /<link rel="sitemap" type="application\/xml" href="https:\/\/www\.sandracai\.com\/sitemap\.xml"/],
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
  ['JSON-LD WebPage', /"@type":\s*"WebPage"/],
  ['JSON-LD dateModified', /"dateModified":\s*"\d{4}-\d{2}-\d{2}"/],
  ['JSON-LD primaryImageOfPage', /"primaryImageOfPage"[\s\S]*?social-card\.jpg/],
  ['JSON-LD worksFor org', /"worksFor":\s*\{\s*"@type":\s*"Organization"/],
  ['JSON-LD publisher person', /"publisher":\s*\{\s*"@type":\s*"Person"/],
  ['meta 4+ years', /4\+ years across industry, research, and founding/],
  ['og locale', /property="og:locale" content="en_US"/],
  ['color-scheme light dark', /<meta name="color-scheme" content="light dark"/],
  ['theme-color', /<meta name="theme-color" content="#FFFDF7"/],
  ['theme boot', /src="\/assets\/theme-boot\.js\?v=\d+"/],
  ['theme toggle', /id="theme-toggle"[^>]*class="ba-theme-toggle"|class="ba-theme-toggle"[^>]*id="theme-toggle"/],
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
  ['work accel title', /id="accel-title"[^>]*tabindex="-1"[^>]*>Accelerating work that ships/],
  ['JSON-LD person id', /"@id":\s*"https:\/\/www\.sandracai\.com\/#person"/],
  ['research section title', /id="research-title"[^>]*tabindex="-1"[^>]*>Independent research/],
  ['academic title', /id="edu-title"[^>]*tabindex="-1"[^>]*>Academic/],
  ['beliefs title', /id="beliefs-title"[^>]*tabindex="-1"[^>]*>Three things I believe/],
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
  ['footer email', /ba-footer-links[\s\S]*?mailto:sandraxcyj@gmail\.com[^>]*aria-label="Email Sandra Cai"/],
  ['contact strip email', /ba-strip-items[\s\S]*?mailto:sandraxcyj@gmail\.com[^>]*aria-label="Email Sandra Cai"/],
  ['gpt disclaimer email aria', /id="gpt-disclaimer"[\s\S]*?mailto:sandraxcyj@gmail\.com[^>]*aria-label="Email Sandra Cai"/],
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
  ['twitter url', /name="twitter:url" content="https:\/\/www\.sandracai\.com\/"/],
  ['og type website', /property="og:type" content="website"/],
  ['academic coursework ml', /id="education"[\s\S]*?algorithms through ML/],
  ['founding card title', /ba-card--lead[\s\S]*?Plurall AI &amp; product/],
  ['footer LinkedIn', /ba-footer-links[\s\S]*?linkedin\.com\/in\/yijia-sandra-cai/],
  ['og image dimensions', /property="og:image:width" content="1200"[\s\S]*?property="og:image:height" content="630"/],
  ['research synthetic media', /id="research"[\s\S]*?synthetic-media trust/],
  ['beliefs microstructure', /id="beliefs"[\s\S]*?Microstructure, risk/],
  ['gpt sidebar history', /id="gpt-history-title"[^>]*>History/],
  ['gpt sidebar labelledby', /class="gpt-sidebar"[^>]*aria-labelledby="gpt-history-title"/],
  ['nav writing substack', /class="ba-nav-external"[^>]*href="https:\/\/substack\.com\/@caisandra"/],
  ['JSON-LD person url', /"url":\s*"https:\/\/www\.sandracai\.com\/"/],
  ['gpt char count', /id="gpt-char-count"[^>]*aria-live="polite"/],
  ['gpt log region', /id="gpt-log"[^>]*role="log"/],
  ['gpt log aria-label', /id="gpt-log"[^>]*aria-label="SandraGPT conversation"/],
  ['gpt input describedby', /id="gpt-input"[^>]*aria-describedby="gpt-disclaimer"/],
  ['gpt input errormessage', /id="gpt-input"[^>]*aria-errormessage="gpt-char-count"/],
  ['skip link top', /class="ba-skip" href="#top"/],
  ['gpt form aria-busy', /id="gpt-form"[^>]*aria-busy="false"/],
  ['gpt sync status', /id="gpt-sync-status"[^>]*role="status"/],
  ['gpt clear history', /id="gpt-clear-history"[^>]*aria-controls="gpt-sidebar-list gpt-log"/],
  ['external strip writing', /aria-label="External links"[\s\S]*?ba-strip-label">Writing/],
  ['og image social card', /property="og:image" content="[^"]*social-card\.jpg"/],
  ['meta viewport', /<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover"/],
  ['robots preview', /<meta name="robots" content="index, follow, max-image-preview:large"/],
  ['gpt enterkeyhint', /id="gpt-input"[^>]*enterkeyhint="send"/],
  ['gpt inputmode search', /id="gpt-input"[^>]*inputmode="search"/],
  ['gpt autocapitalize off', /id="gpt-input"[^>]*autocapitalize="off"/],
  ['gpt autocorrect off', /id="gpt-input"[^>]*autocorrect="off"/],
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
  ['footer contentinfo', /<footer class="ba-footer" role="contentinfo"/],
  ['external strip contact email', /aria-label="External links"[\s\S]*?ba-strip-label">Contact[\s\S]*?sandraxcyj@gmail\.com/],
  ['connector strip text', /aria-label="Connector"[\s\S]*?class="ba-strip-text"/],
  ['nav primary label', /<nav class="ba-nav" aria-label="Primary">/],
  ['hero focus aria', /class="ba-focus"[^>]*aria-label="Focus areas"/],
  ['gpt noscript email', /<noscript>[\s\S]*?mailto:sandraxcyj@gmail\.com[^>]*aria-label="Email Sandra Cai"/],
  ['footer name', /class="ba-footer-name"[^>]*>Sandra Cai/],
  ['hero technical education', /class="ba-student-note"[^>]*>[\s\S]*?Technical education/],
  ['gpt spellcheck', /id="gpt-input"[^>]*spellcheck="true"/],
  ['gpt form autocomplete', /id="gpt-form"[^>]*autocomplete="off"/],
  ['JSON-LD founder person', /"founder":\s*\{\s*"@type":\s*"Person"/],
  ['gpt log relevant additions', /id="gpt-log"[^>]*aria-relevant="additions"/],
  ['gpt char count atomic', /id="gpt-char-count"[^>]*aria-atomic="true"/],
  ['font preload crossorigin', /rel="preload"[^>]*Geist-Variable\.woff2[^>]*crossorigin/],
  ['apple touch icon', /rel="apple-touch-icon"[^>]*sizes="180x180"[^>]*apple-touch-icon\.png/],
  ['footer current year fallback', /id="year">2026<\/span>/],
  ['favicon ico', /rel="icon"[^>]*favicon\.ico/],
  ['sandra gpt script defer', /src="\/assets\/sandra-gpt\.js\?v=\d+" defer/],
  ['site script defer', /src="\/assets\/script\.js\?v=\d+" defer/],
  ['JSON-LD query-input', /"query-input":\s*"required name=search_term_string"/],
  ['favicon 32 png', /rel="icon"[^>]*favicon-32\.png/],
  ['JSON-LD context schema', /"@context":\s*"https:\/\/schema\.org"/],
  ['favicon 16 png', /rel="icon"[^>]*favicon-16\.png/],
  ['gpt maxlength matches constant', /id="gpt-input"[^>]*maxlength="280"/],
  ['perspective split a', /class="ba-split-a"[^>]*>Rigor as/],
  ['perspective title focusable', /id="split-title"[^>]*tabindex="-1"/],
  ['agent subtitle tagline', /class="ba-agent-sub"[^>]*id="gpt-tagline"/],
  ['beliefs bare cards', /id="beliefs"[\s\S]*?ba-card--bare[\s\S]*?Show the work/],
  ['gpt send default label', /class="gpt-send"[^>]*aria-label="Enter a question to send"/],
  ['gpt kbd slash', /class="gpt-kbd"[^>]*>\/<\/kbd>/],
  ['og image type jpeg', /property="og:image:type" content="image\/jpeg"/],
  ['twitter image alt', /name="twitter:image:alt" content="[^"]*Plurall AI/],
  ['gpt clear confirm copy', /id="gpt-clear-history"[^>]*aria-label="Clear question history"/],
  ['theme color', /<meta name="theme-color" content="#FFFDF7"/],
  ['sticky header', /class="ba-header"/],
  ['gpt shell layout', /class="ba-agent-card gpt-shell"/],
  ['jsonld knows systems', /"knowsAbout"[\s\S]*?"Systems engineering"/],
  ['hero lead strong years', /class="ba-lead"[\s\S]*?<strong>4\+ years<\/strong>/],
  ['research list landmark', /id="research"[\s\S]*?<ul class="ba-list"[^>]*role="list"/],
  ['gpt sidebar list role', /id="gpt-sidebar-list"[^>]*role="list"/],
  ['gpt sidebar aria-busy', /id="gpt-sidebar-list"[^>]*aria-busy="false"/],
  ['gpt form labelledby', /id="gpt-form"[^>]*aria-labelledby="gpt-heading"/],
  ['agent scroll margin', /id="sandra-gpt"[^>]*class="ba-agent"/],
  ['nav separator', /class="ba-nav-sep"[^>]*aria-hidden="true"/],
  ['work section scroll target', /class="ba-section"[^>]*id="work"/],
  ['education section', /class="ba-section ba-section--education"[^>]*id="education"/],
  ['founding lead card', /ba-card--lead[\s\S]*?ba-phase">Founding/],
  ['logo mark sandra', /class="ba-logo-mark"[^>]*>Sandra/],
  ['gpt heading focusable', /id="gpt-heading"[^>]*tabindex="-1"/],
];

const html404 = read('404.html');
assertChecks('404.html', html404, checks404);
if (/rel=["']canonical["']/.test(html404)) {
  console.error('validate-basic-html: 404.html must not declare a canonical URL (keep noindex only)');
  process.exit(1);
}
const indexHtml = read('index.html');
assertChecks('index.html', indexHtml, checksIndex);
if (/http-equiv=["']Content-Security-Policy["']/i.test(indexHtml) || /http-equiv=["']Content-Security-Policy["']/i.test(html404)) {
  console.error('validate-basic-html: CSP must be header-only (no http-equiv meta)');
  process.exit(1);
}

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

for (const asset of ['favicon.ico', 'favicon-16.png', 'favicon-32.png', 'apple-touch-icon.png']) {
  const re = new RegExp(`${asset.replace(/\./g, '\\.')}\\?v=(\\d+)`);
  const indexV = indexHtml.match(re);
  const page404V = html404.match(re);
  if (!indexV || !page404V) {
    console.error(`validate-basic-html: could not parse ${asset} cache version on index/404`);
    process.exit(1);
  }
  if (indexV[1] !== page404V[1]) {
    console.error(`validate-basic-html: index.html and 404.html ${asset} cache versions must match`);
    process.exit(1);
  }
}

const indexGptV = indexHtml.match(/src="\/assets\/sandra-gpt\.js\?v=(\d+)"/);
if (!indexGptV) {
  console.error('validate-basic-html: could not parse sandra-gpt.js cache version');
  process.exit(1);
}

const gptJs = read('assets/sandra-gpt.js');
const siteJs = read('assets/script.js');
const stylesCss = read('assets/styles.css');

function assertCacheBust(label, htmlVersion, source, pattern) {
  const marker = source.match(pattern);
  if (!marker) {
    console.error(`validate-basic-html: ${label} missing cache-bust marker`);
    process.exit(1);
  }
  if (marker[1] !== htmlVersion) {
    console.error(`validate-basic-html: ${label} cache-bust ${marker[1]} must match HTML ?v=${htmlVersion}`);
    process.exit(1);
  }
}
assertCacheBust('styles.css', indexCssV[1], stylesCss, /cache-bust:\s*(\d+)/);
assertCacheBust('script.js', indexScriptV[1], siteJs, /cache-bust:\s*(\d+)/);
assertCacheBust('sandra-gpt.js', indexGptV[1], gptJs, /cache-bust:\s*(\d+)/);

const themeBoot = read('assets/theme-boot.js');
const indexBootV = indexHtml.match(/src="\/assets\/theme-boot\.js\?v=(\d+)"/);
const boot404V = html404.match(/src="\/assets\/theme-boot\.js\?v=(\d+)"/);
if (!indexBootV || !boot404V) {
  console.error('validate-basic-html: could not parse theme-boot.js cache version');
  process.exit(1);
}
if (indexBootV[1] !== boot404V[1]) {
  console.error('validate-basic-html: index.html and 404.html theme-boot.js cache versions must match');
  process.exit(1);
}
assertCacheBust('theme-boot.js', indexBootV[1], themeBoot, /cache-bust:\s*(\d+)/);
if (!themeBoot.includes("localStorage.getItem('ba-theme')") || !themeBoot.includes('data-theme')) {
  console.error('validate-basic-html: theme-boot.js must apply stored data-theme before paint');
  process.exit(1);
}
if (!siteJs.includes('function initThemeToggle') || !siteJs.includes('THEME_KEY') || !siteJs.includes('ba-theme')) {
  console.error('validate-basic-html: script.js must implement theme toggle with localStorage');
  process.exit(1);
}
if (!stylesCss.includes('html[data-theme="dark"]') || !stylesCss.includes('prefers-color-scheme: dark') || !stylesCss.includes('.ba-theme-toggle') || !stylesCss.includes('--theme-chrome')) {
  console.error('validate-basic-html: styles must define dark theme tokens and theme toggle');
  process.exit(1);
}
if (!stylesCss.includes('color-scheme: light dark')) {
  console.error('validate-basic-html: html must declare color-scheme light dark');
  process.exit(1);
}
if (!/\.gpt-turn\s*\{[\s\S]*?scroll-margin-top:\s*6rem/.test(stylesCss)) {
  console.error('validate-basic-html: .gpt-turn must set scroll-margin-top 6rem for sticky header');
  process.exit(1);
}
if (!/html\s*\{[\s\S]*?scroll-padding-top:\s*5\.5rem/.test(stylesCss)) {
  console.error('validate-basic-html: html must set scroll-padding-top 5.5rem');
  process.exit(1);
}
if (!/\.ba-agent\s*\{[\s\S]*?scroll-margin-top:\s*5\.5rem/.test(stylesCss)) {
  console.error('validate-basic-html: .ba-agent must set scroll-margin-top 5.5rem');
  process.exit(1);
}
if (!/\.ba-section\s*\{[\s\S]*?scroll-margin-top:\s*5\.5rem/.test(stylesCss)) {
  console.error('validate-basic-html: .ba-section must set scroll-margin-top 5.5rem');
  process.exit(1);
}
if (!/@media\s*\(prefers-contrast:\s*more\)[\s\S]*?\.ba-logo-mark[\s\S]*?color:\s*var\(--text\)/.test(stylesCss)) {
  console.error('validate-basic-html: high-contrast must set .ba-logo-mark to var(--text)');
  process.exit(1);
}
if (!/@media\s*\(prefers-contrast:\s*more\)[\s\S]*?\.ba-logo-accent[\s\S]*?color:\s*var\(--text\)/.test(stylesCss)) {
  console.error('validate-basic-html: high-contrast must set .ba-logo-accent to var(--text)');
  process.exit(1);
}
for (const [label, snippet] of [
  ['scroll spy current location', "setAttribute('aria-current', 'location')"],
  ['scroll spy observer fallback', "typeof IntersectionObserver === 'function'"],
  ['hashchange always registered', "window.addEventListener('hashchange', applyHash)"],
  ['passive scroll listener', '{ passive: true }'],
  ['js class marker', "document.documentElement.classList.add('js')"],
  ['programmatic focus helper', 'function focusProgrammatic'],
  ['section focus helper', 'function focusSectionById'],
  ['landmark same-hash refocus', 'function initLandmarkRefocus'],
  ['focusVisible option', 'focusVisible: true'],
  ['nav same-hash work', "'#work'"],
  ['nav same-hash sandragpt', "'#sandra-gpt'"],
  ['observer pagehide disconnect', 'observer.disconnect()'],
  ['bfcache persist guard', '!event.persisted'],
  ['bfcache pageshow reapply', "addEventListener('pageshow'"],
  ['scroll spy clear past education', "clearTargets"],
  ['scroll spy beliefs clear', "'beliefs'"],
  ['scroll spy hero clear', "querySelector('.ba-hero')"],
  ['scroll spy home hash clear', 'else clearActive()'],
  ['hash focus target helper', 'focusHashTarget'],
  ['hash focus work heading', "work: 'accel-title'"],
  ['hash focus beliefs heading', "beliefs: 'beliefs-title'"],
  ['hash focus perspective heading', "perspective: 'split-title'"],
  ['404 focus title on load', 'function focus404Title'],
  ['404 bfcache title focus', 'if (event.persisted) focus404Title()'],
  ['scroll timer pagehide clear', 'clearTimeout(scrollTimer)'],
  ['dynamic footer year', 'new Date().getFullYear()'],
]) {
  if (!siteJs.includes(snippet)) {
    console.error(`validate-basic-html: assets/script.js missing expected: ${label}`);
    process.exit(1);
  }
}
if (!siteJs.includes('let observer = null') && !siteJs.includes('let observer=null')) {
  console.error('validate-basic-html: scroll spy must keep observer nullable for pagehide cleanup');
  process.exit(1);
}
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
const twitterUrl = indexHtml.match(/<meta name="twitter:url" content="([^"]+)"/);
if (!twitterUrl || twitterUrl[1] !== canonical[1]) {
  console.error('validate-basic-html: twitter:url must match canonical');
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

const apiJs = read('api/sandra-gpt.js');
const apiMaxQ = apiJs.match(/const MAX_Q = (\d+);/);
if (!apiMaxQ || apiMaxQ[1] !== maxQ[1]) {
  console.error('validate-basic-html: api/sandra-gpt.js MAX_Q must match client MAX_QUESTION_CHARS');
  process.exit(1);
}
if (!apiJs.includes("X-Robots-Tag', 'noindex, nofollow'")) {
  console.error('validate-basic-html: api/sandra-gpt.js must set X-Robots-Tag noindex, nofollow');
  process.exit(1);
}
if (!apiJs.includes("Cache-Control', 'no-store'")) {
  console.error('validate-basic-html: api/sandra-gpt.js must set Cache-Control no-store');
  process.exit(1);
}
if (!/sanitize\(row\.question, MAX_Q\)/.test(apiJs) || !/sanitize\(row\.answer, MAX_A\)/.test(apiJs)) {
  console.error('validate-basic-html: api GET must sanitize question and answer fields');
  process.exit(1);
}
if (!apiJs.includes('payload_too_large') || !apiJs.includes('not_configured')) {
  console.error('validate-basic-html: api must handle payload_too_large and not_configured');
  process.exit(1);
}
if (!/413[\s\S]{0,120}payload_too_large/.test(apiJs)) {
  console.error('validate-basic-html: api must return 413 for payload_too_large');
  process.exit(1);
}
if (!/r\.status === 413[\s\S]{0,80}return 'payload_too_large'/.test(gptJs)) {
  console.error('validate-basic-html: postTurnRemote must fast-fail on 413 with payload_too_large sentinel');
  process.exit(1);
}
if (!gptJs.includes("setSyncStatus('warn', 'payload')") || !/ok === 'payload_too_large'/.test(gptJs)) {
  console.error('validate-basic-html: 413 must show payload warn sync status, not API-off');
  process.exit(1);
}
if (!/rawQ\.length > MAX_Q/.test(apiJs) || !/rawA\.length > MAX_A/.test(apiJs)) {
  console.error('validate-basic-html: api must reject oversize q/a fields with 413');
  process.exit(1);
}
if (!/replace\(\/\\u0000\/g,\s*''\)/.test(apiJs)) {
  console.error('validate-basic-html: api sanitize must strip null bytes');
  process.exit(1);
}
if (!apiJs.includes('function retryAfterHeader') || !apiJs.includes("setHeader('Retry-After'")) {
  console.error('validate-basic-html: api/sandra-gpt.js must set Retry-After from remaining window');
  process.exit(1);
}
if (!apiJs.includes("Allow', 'GET, POST, HEAD, OPTIONS'")) {
  console.error('validate-basic-html: api/sandra-gpt.js must Allow GET, POST, HEAD, OPTIONS');
  process.exit(1);
}
const optionsBlock = apiJs.match(/if \(req\.method === 'OPTIONS' \|\| req\.method === 'HEAD'\) \{[\s\S]*?return res\.status\(204\)/);
if (!optionsBlock || !optionsBlock[0].includes("X-Content-Type-Options', 'nosniff'")) {
  console.error('validate-basic-html: OPTIONS/HEAD 204 must set X-Content-Type-Options nosniff');
  process.exit(1);
}
const apiMaxA = apiJs.match(/const MAX_A = (\d+);/);
if (!apiMaxA || Number(apiMaxA[1]) < 1000 || Number(apiMaxA[1]) > 20000) {
  console.error('validate-basic-html: api/sandra-gpt.js MAX_A must be between 1000 and 20000');
  process.exit(1);
}
const maxAnswerChars = gptJs.match(/const MAX_ANSWER_CHARS = (\d+);/);
if (!maxAnswerChars || maxAnswerChars[1] !== apiMaxA[1]) {
  console.error('validate-basic-html: MAX_ANSWER_CHARS must match api MAX_A');
  process.exit(1);
}
if (!apiJs.includes('.limit(80)')) {
  console.error('validate-basic-html: api/sandra-gpt.js GET must limit turns to 80');
  process.exit(1);
}
const maxTurns = gptJs.match(/const MAX_TURNS = (\d+);/);
if (!maxTurns || maxTurns[1] !== '80') {
  console.error('validate-basic-html: MAX_TURNS in sandra-gpt.js must be 80');
  process.exit(1);
}
const dupWindow = gptJs.match(/const DUPLICATE_SUBMIT_WINDOW_MS = (\d+);/);
if (!dupWindow || Number(dupWindow[1]) < 500 || Number(dupWindow[1]) > 5000) {
  console.error('validate-basic-html: DUPLICATE_SUBMIT_WINDOW_MS must be between 500 and 5000');
  process.exit(1);
}
if (!gptJs.includes("typeof crypto.randomUUID === 'function'")) {
  console.error('validate-basic-html: sandra-gpt.js must fall back when crypto.randomUUID is missing');
  process.exit(1);
}
if (!/const RESET_HISTORY_ON_LOAD = false;/.test(gptJs)) {
  console.error('validate-basic-html: RESET_HISTORY_ON_LOAD must be false for production');
  process.exit(1);
}
if (!gptJs.includes("'Sending…'") && !gptJs.includes('"Sending…"')) {
  console.error('validate-basic-html: send button busy state must use Sending… aria-label');
  process.exit(1);
}
if (!gptJs.includes('applyDeepLinkQuestion') || !gptJs.includes('URLSearchParams')) {
  console.error('validate-basic-html: sandra-gpt.js must support ?q= deep-link prefills');
  process.exit(1);
}
if (!/applyDeepLinkQuestion\(\);[\s\S]{0,120}void restoreHistory\(\)/.test(gptJs)) {
  console.error('validate-basic-html: applyDeepLinkQuestion must run before restoreHistory');
  process.exit(1);
}
if (!/applyDeepLinkQuestion\(\);[\s\S]{0,80}updateCharCount\(\)/.test(gptJs)) {
  console.error('validate-basic-html: init must refresh char count after deep-link prefill');
  process.exit(1);
}
if (/restoreHistory\(\)\.then\(/.test(gptJs)) {
  console.error('validate-basic-html: restoreHistory must not chain post-hydrate focus (focus steal)');
  process.exit(1);
}
if (gptJs.includes('focusSandraGptFromHash') || /addEventListener\(\s*'hashchange'/.test(gptJs)) {
  console.error('validate-basic-html: #sandra-gpt hash focus must live in script.js only');
  process.exit(1);
}
const deepLinkFn = gptJs.match(/function applyDeepLinkQuestion\(\) \{[\s\S]*?\n  function /);
if (!deepLinkFn || /requestSubmit/.test(deepLinkFn[0])) {
  console.error('validate-basic-html: ?q= deep links must prefill without auto-submit');
  process.exit(1);
}
if (!deepLinkFn[0].includes('#sandra-gpt') || !deepLinkFn[0].includes("aria-current', 'location'")) {
  console.error('validate-basic-html: ?q= deep links must set #sandra-gpt and nav aria-current');
  process.exit(1);
}
if (!deepLinkFn[0].includes("getAttribute('href') === '#sandra-gpt'")) {
  console.error('validate-basic-html: ?q= deep links must locate SandraGPT nav without href= selector');
  process.exit(1);
}
if (!gptJs.includes('prefill SandraGPT from the query string and strip q') || /submit once/.test(gptJs)) {
  console.error('validate-basic-html: deep-link reply must describe prefill without auto-submit');
  process.exit(1);
}
if (!gptJs.includes("e.key === 'Escape'") || !gptJs.includes('input.blur()')) {
  console.error('validate-basic-html: sandra-gpt.js must blur input on Escape');
  process.exit(1);
}
if (!gptJs.includes("getElementById('gpt-heading')") || !gptJs.includes('heading.focus')) {
  console.error('validate-basic-html: Escape should move focus to gpt-heading');
  process.exit(1);
}
if (!gptJs.includes('e.repeat')) {
  console.error('validate-basic-html: slash shortcut must ignore key repeat');
  process.exit(1);
}
if (!/addEventListener\(\s*'pagehide'[\s\S]*?clearTimeout\(onlineDebounce\)/.test(gptJs)) {
  console.error('validate-basic-html: online sync debounce must clear on pagehide');
  process.exit(1);
}
if (!gptJs.includes('clearTimeout(submitBusyTimer)') || !gptJs.includes('function resetSubmitBusy')) {
  console.error('validate-basic-html: submit busy timer must clear via resetSubmitBusy');
  process.exit(1);
}
if (!gptJs.includes("addEventListener('pageshow'") || !gptJs.includes('resetSubmitBusy()')) {
  console.error('validate-basic-html: sandra-gpt.js must reset submit busy on bfcache pageshow');
  process.exit(1);
}
if (!gptJs.includes('function resetClearBusy') || !gptJs.includes('resetClearBusy()')) {
  console.error('validate-basic-html: sandra-gpt.js must reset clearBusy on pagehide/pageshow');
  process.exit(1);
}
if (!gptJs.includes('function recycleApiAbort') || !gptJs.includes('signal: apiSignal()')) {
  console.error('validate-basic-html: sandra-gpt.js must abort in-flight API fetches on leave');
  process.exit(1);
}
if (/async function clearRemote[\s\S]*?signal:\s*apiSignal\(\)/.test(gptJs)) {
  console.error('validate-basic-html: clearRemote must not use shared abort signal');
  process.exit(1);
}
if (!gptJs.includes("aria-live', 'off'") || !gptJs.includes("aria-busy', 'true'")) {
  console.error('validate-basic-html: restoreHistory must mute live region while hydrating');
  process.exit(1);
}
if (!gptJs.includes('syncLivePrev')) {
  console.error('validate-basic-html: restoreHistory must mute sync status while hydrating');
  process.exit(1);
}
if (!gptJs.includes('SUBMIT_BUSY_MS') || !gptJs.includes('historyEpoch')) {
  console.error('validate-basic-html: submit busy constant and history epoch race guard required');
  process.exit(1);
}
if (!gptJs.includes('function updateClearState') || !gptJs.includes('clearBusy')) {
  console.error('validate-basic-html: Clear button must track empty/busy state');
  process.exit(1);
}
if (!gptJs.includes('clearBtn.setAttribute(\'aria-label\'') || !gptJs.includes('Nothing to clear') || !gptJs.includes('Clearing question history') || !/restorePending\) clearLabel = 'Loading history…'/.test(gptJs)) {
  console.error('validate-basic-html: Clear button aria-label must reflect empty, busy, and restore states');
  process.exit(1);
}
if (!/emptyEl\.hidden = restorePending/.test(gptJs)) {
  console.error('validate-basic-html: sidebar empty placeholder must hide during restore');
  process.exit(1);
}
if (!gptJs.includes('sidebarList.setAttribute(\'aria-busy\'') || !/restorePending \|\| clearBusy/.test(gptJs)) {
  console.error('validate-basic-html: sidebar list must expose aria-busy during restore/clear');
  process.exit(1);
}
if (!/submitBusy \|\| restorePending \|\| clearBusy/.test(gptJs)) {
  console.error('validate-basic-html: handleSubmit must gate on clearBusy');
  process.exit(1);
}
if (!gptJs.includes("'Clearing…'") || !gptJs.includes('restorePending || clearBusy')) {
  console.error('validate-basic-html: send/starters must disable and label Clearing… while clearBusy');
  process.exit(1);
}
if (!gptJs.includes('function scheduleRateLimitedRetry') || !gptJs.includes('Retry-After')) {
  console.error('validate-basic-html: client must honor Retry-After with a delayed sync');
  process.exit(1);
}
if (!gptJs.includes('r.status === 429') || !gptJs.includes('scheduleRateLimitedRetry(parseRetryAfterMs(r))')) {
  console.error('validate-basic-html: fetchRemoteHistory must honor GET 429 Retry-After');
  process.exit(1);
}
if (!gptJs.includes("cache: 'no-store'")) {
  console.error('validate-basic-html: SandraGPT fetches must use cache no-store');
  process.exit(1);
}
if (!gptJs.includes('rateLimited: true') || !gptJs.includes("detail: 'rate'")) {
  console.error('validate-basic-html: GET 429 must surface rate-limited sync status');
  process.exit(1);
}
if (!gptJs.includes('pendingServerClear') || !gptJs.includes('function applyClearRemoteResult')) {
  console.error('validate-basic-html: failed server Clear must retry instead of claiming API-off');
  process.exit(1);
}
if (!/clearTimeout\(rateRetryTimer\)/.test(gptJs)) {
  console.error('validate-basic-html: Clear must cancel pending rate-limit retries');
  process.exit(1);
}
if (!gptJs.includes('function delayMs') || !gptJs.includes("addEventListener('abort'")) {
  console.error('validate-basic-html: postTurnRemote retry delay must be abort-aware');
  process.exit(1);
}
if (!stylesCss.includes('.ba-404-title:focus') || !stylesCss.includes('.ba-404-title:focus-visible')) {
  console.error('validate-basic-html: styles must show a focus ring on .ba-404-title');
  process.exit(1);
}
if (!stylesCss.includes('forced-colors: active') || !stylesCss.includes('CanvasText') || !stylesCss.includes('.ba-deck a:focus-visible') || !stylesCss.includes('.gpt-note a:focus-visible') || !stylesCss.includes('.gpt-field:focus-within') || !stylesCss.includes('.gpt-send:disabled') || !stylesCss.includes('.gpt-sidebar-clear:disabled') || !stylesCss.includes('.gpt-field--readonly') || !stylesCss.includes('.gpt-field--at-limit') || !stylesCss.includes('.gpt-field--near-limit') || !stylesCss.includes('.gpt-char-count--at-limit') || !stylesCss.includes('.gpt-sync-status--warn') || !stylesCss.includes('.gpt-sync-status:empty') || !stylesCss.includes('.gpt-sidebar-empty[hidden]')) {
  console.error('validate-basic-html: forced-colors must restore focus outlines and busy/urgency styling');
  process.exit(1);
}
if (!gptJs.includes('Network errors are a warn') || !/catch \(err\) \{[\s\S]*?apiDisabled: false, turns: null/.test(gptJs)) {
  console.error('validate-basic-html: fetchRemoteHistory catch must treat network errors as warn, not API-off');
  process.exit(1);
}
if (!gptJs.includes('function flushOnlineSync') || !gptJs.includes('onlineSyncQueued')) {
  console.error('validate-basic-html: online sync must queue and flush after restore');
  process.exit(1);
}
if (!gptJs.includes('Disable Clear before confirm') || !/clearBusy = true;[\s\S]{0,200}window\.confirm/.test(gptJs)) {
  console.error('validate-basic-html: clearAllHistory must set clearBusy before confirm');
  process.exit(1);
}
if (!gptJs.includes('return keyboard users to Clear') || !gptJs.includes('clearBtn.focus')) {
  console.error('validate-basic-html: Clear cancel must restore focus to the Clear button');
  process.exit(1);
}
if (!gptJs.includes('function updateSidebarBusy') || !gptJs.includes('btn.disabled = busy')) {
  console.error('validate-basic-html: sidebar history buttons must disable while restore/clear busy');
  process.exit(1);
}
if (!gptJs.includes('keepalive: true')) {
  console.error('validate-basic-html: clearRemote must use keepalive so wipe can finish on navigate');
  process.exit(1);
}
if (!/for \(const row of recentRemote\) \{\s*\n\s*if \(epoch !== historyEpoch\) return;/.test(gptJs)) {
  console.error('validate-basic-html: restoreHistory remote loop must check historyEpoch each turn');
  process.exit(1);
}
if (!/for \(const row of entries\) \{\s*\n\s*if \(epoch !== historyEpoch\) return;/.test(gptJs)) {
  console.error('validate-basic-html: restoreHistory local loop must check historyEpoch each turn');
  process.exit(1);
}
if (!gptJs.includes('function addSidebarEntry') || !gptJs.includes('if (restorePending || clearBusy) return;') || !gptJs.includes('scrollToTurn(turnId)')) {
  console.error('validate-basic-html: history sidebar clicks must no-op while restore/clear busy');
  process.exit(1);
}
if (!/flushOnlineSync[\s\S]{0,120}restorePending \|\| clearBusy/.test(gptJs)) {
  console.error('validate-basic-html: flushOnlineSync must no-op while clearBusy');
  process.exit(1);
}
if (!gptJs.includes('input.readOnly = readOnly') || !gptJs.includes('const readOnly = restorePending || clearBusy')) {
  console.error('validate-basic-html: input must be readOnly while restorePending or clearBusy');
  process.exit(1);
}
if (!gptJs.includes("setAttribute('aria-readonly', 'true')") || !gptJs.includes("removeAttribute('aria-readonly')")) {
  console.error('validate-basic-html: input aria-readonly must track restore/clear busy state');
  process.exit(1);
}
if (!gptJs.includes('gpt-field--readonly')) {
  console.error('validate-basic-html: read-only input must toggle gpt-field--readonly on the pill');
  process.exit(1);
}
if (!gptJs.includes('gpt-char-count--low')) {
  console.error('validate-basic-html: char count must escalate styling when near the limit');
  process.exit(1);
}
if (!gptJs.includes('gpt-char-count--at-limit') || !gptJs.includes("setAttribute('aria-invalid', 'true')")) {
  console.error('validate-basic-html: char count must mark at-limit input invalid');
  process.exit(1);
}
if (!gptJs.includes('gpt-field--at-limit') || !gptJs.includes("setAttribute('role', 'alert')")) {
  console.error('validate-basic-html: at-limit char count must style pill and alert screen readers');
  process.exit(1);
}
if (!gptJs.includes('gpt-field--near-limit')) {
  console.error('validate-basic-html: near-limit char count must style the input pill');
  process.exit(1);
}
if (!gptJs.includes("'aria-describedby'") || !/gpt-disclaimer gpt-char-count/.test(gptJs)) {
  console.error('validate-basic-html: char count must add gpt-char-count to aria-describedby when visible');
  process.exit(1);
}
if (!/questions\[recallIndex\][\s\S]{0,80}\.slice\(0, MAX_QUESTION_CHARS\)/.test(gptJs)) {
  console.error('validate-basic-html: history recall must truncate to MAX_QUESTION_CHARS');
  process.exit(1);
}
if (!/row\.q\.trim\(\)\.slice\(0, MAX_QUESTION_CHARS\)/.test(gptJs)) {
  console.error('validate-basic-html: normalizeTurns must truncate questions to MAX_QUESTION_CHARS');
  process.exit(1);
}
if (!/q\.length > MAX_QUESTION_CHARS[\s\S]{0,400}focusInputField\(\)/.test(gptJs)) {
  console.error('validate-basic-html: over-limit submit must refocus the input field');
  process.exit(1);
}
if (!/if \(r\.status === 503 \|\| r\.status === 404\) return false;/.test(gptJs) || !/if \(r\.ok\) return true;/.test(gptJs)) {
  console.error('validate-basic-html: postTurnRemote must return false on 503/404 and true on ok');
  process.exit(1);
}
if (!gptJs.includes('Capture once so Clear') || !gptJs.includes('const signal = apiSignal()')) {
  console.error('validate-basic-html: postTurnRemote must capture abort signal outside the retry loop');
  process.exit(1);
}
if (!gptJs.includes('function updateSidebarEmpty') || !gptJs.includes("aria-controls', `gpt-turn-${turnId}`")) {
  console.error('validate-basic-html: sidebar empty state and aria-controls on history items required');
  process.exit(1);
}
if (!/addEventListener\('pageshow'[\s\S]*?resumeRateLimitedRetryOrFlush\(\)/.test(gptJs)) {
  console.error('validate-basic-html: bfcache pageshow must resume rate-limit wait or flush sync');
  process.exit(1);
}
if (!gptJs.includes('rateRetryNotBefore') || !gptJs.includes('Keep rateRetryNotBefore')) {
  console.error('validate-basic-html: pagehide must preserve rateRetryNotBefore across bfcache');
  process.exit(1);
}
if (!gptJs.includes('CLEAR_WARN_RETRY_MS') || !gptJs.includes('Soft-retry a failed wipe')) {
  console.error('validate-basic-html: failed Clear warn must soft-retry');
  process.exit(1);
}
if (!/metaKey\) \|\| e\.key !== 'Enter'[\s\S]{0,80}restorePending \|\| clearBusy \|\| submitBusy/.test(gptJs)) {
  console.error('validate-basic-html: Ctrl/Cmd+Enter must gate on restore/clear/submit busy');
  process.exit(1);
}
if (!/ArrowUp[\s\S]{0,160}if \(restorePending \|\| clearBusy \|\| submitBusy\) return;/.test(gptJs)) {
  console.error('validate-basic-html: history recall must no-op while restore/clear/submit busy');
  process.exit(1);
}
if (!/restorePending = true;\s*\n\s*if \(form\) form\.setAttribute\('aria-busy', 'true'\)/.test(gptJs)) {
  console.error('validate-basic-html: restoreHistory must set form aria-busy while hydrating');
  process.exit(1);
}
if (!gptJs.includes('syncAfterLive') || !gptJs.includes('Announce after live is back')) {
  console.error('validate-basic-html: restoreHistory must announce sync status after aria-live returns');
  process.exit(1);
}
if (!gptJs.includes('Array.isArray(remote)') || !gptJs.includes("mode: 'warn'")) {
  console.error('validate-basic-html: restoreHistory must warn when remote fetch returns null');
  process.exit(1);
}
if (!gptJs.includes('btn.disabled = restorePending')) {
  console.error('validate-basic-html: starter buttons must disable while restorePending');
  process.exit(1);
}
if (!gptJs.includes('512×512') || !gptJs.includes('site.webmanifest names the site')) {
  console.error('validate-basic-html: manifest Q&A must mention 512×512 icon');
  process.exit(1);
}
if (!/historyEpoch \+= 1/.test(gptJs) || !gptJs.includes('Invalidate in-flight restore')) {
  console.error('validate-basic-html: handleSubmit must bump historyEpoch to beat restore race');
  process.exit(1);
}
if (!gptJs.includes("setAttribute('aria-label', questionText)")) {
  console.error('validate-basic-html: history sidebar items must expose full question aria-label');
  process.exit(1);
}
if (!gptJs.includes("setAttribute('aria-label', q)")) {
  console.error('validate-basic-html: starter buttons must aria-label from data-q when truncated');
  process.exit(1);
}
if (!/if \(restorePending \|\| clearBusy\) return;/.test(gptJs) || !gptJs.includes('form.requestSubmit()')) {
  console.error('validate-basic-html: starter prompts must no-op while restorePending or clearBusy');
  process.exit(1);
}
if (!gptJs.includes('function focusInputField') || !gptJs.includes('focusVisible: true')) {
  console.error('validate-basic-html: sandra-gpt.js must focus input with focusVisible helper');
  process.exit(1);
}
if (/\binput\.focus\(\)/.test(gptJs)) {
  console.error('validate-basic-html: sandra-gpt.js must not use bare input.focus()');
  process.exit(1);
}
if (!gptJs.includes('function prefersReducedMotion')) {
  console.error('validate-basic-html: sandra-gpt.js must respect prefers-reduced-motion');
  process.exit(1);
}
if (!gptJs.includes('window.confirm') || !gptJs.includes('clearAllHistory')) {
  console.error('validate-basic-html: clear history must confirm before wiping');
  process.exit(1);
}
if (!gptJs.includes("addEventListener('online'")) {
  console.error('validate-basic-html: sandra-gpt.js must retry sync when back online');
  process.exit(1);
}
if (!gptJs.includes("aria-label', 'You asked'") || !gptJs.includes("aria-label', 'SandraGPT replied'")) {
  console.error('validate-basic-html: chat turns must expose You asked / SandraGPT replied labels');
  process.exit(1);
}
if (!gptJs.includes('function scrollToTurn') || !gptJs.includes('gpt-turn-')) {
  console.error('validate-basic-html: history sidebar must scroll to gpt-turn elements');
  process.exit(1);
}
if (!gptJs.includes("aria-current', 'true'")) {
  console.error('validate-basic-html: active history item must set aria-current');
  process.exit(1);
}
if (/https?:\/\//i.test(gptJs) || /\bhref\s*=/i.test(gptJs)) {
  console.error('validate-basic-html: sandra-gpt.js must not embed http(s) URLs or href= (plain-text replies only)');
  process.exit(1);
}
if (!gptJs.includes('/* quota or private mode */')) {
  console.error('validate-basic-html: saveHistory must tolerate private mode / quota failures');
  process.exit(1);
}
if (!/saveHistory[\s\S]{0,120}normalizeTurns\(entries\)/.test(gptJs)) {
  console.error('validate-basic-html: saveHistory must persist normalized turns');
  process.exit(1);
}
if (!gptJs.includes('MAX_ANSWER_CHARS') || !/row\.a\.trim\(\)\.slice\(0, MAX_ANSWER_CHARS\)/.test(gptJs)) {
  console.error('validate-basic-html: normalizeTurns must truncate answers to MAX_ANSWER_CHARS');
  process.exit(1);
}
if (!/postTurnRemote[\s\S]{0,200}safeQ/.test(gptJs) || !/safeA = typeof a === 'string' \? a\.trim\(\)\.slice\(0, MAX_ANSWER_CHARS\)/.test(gptJs)) {
  console.error('validate-basic-html: postTurnRemote must trim and slice q/a before JSON.stringify');
  process.exit(1);
}
if (!gptJs.includes('gpt-sync-status--local')) {
  console.error('validate-basic-html: local sync status must use gpt-sync-status--local styling');
  process.exit(1);
}
if (!gptJs.includes('.textContent = q') || !gptJs.includes('.textContent = answerText')) {
  console.error('validate-basic-html: chat turns must render via textContent (not HTML)');
  process.exit(1);
}
if (!gptJs.includes('[contenteditable="true"], [role="textbox"]')) {
  console.error('validate-basic-html: slash shortcut must ignore contenteditable/textbox fields');
  process.exit(1);
}
if (!gptJs.includes("e.code === 'Slash'") || !gptJs.includes('!e.shiftKey')) {
  console.error('validate-basic-html: slash shortcut must use KeyboardEvent.code with shift guard');
  process.exit(1);
}
if (!gptJs.includes('function greetingReply') || !gptJs.includes('function thanksReply') || !gptJs.includes('function goodbyeReply')) {
  console.error('validate-basic-html: sandra-gpt.js must handle greeting/thanks/goodbye intents');
  process.exit(1);
}
if (!gptJs.includes('sandra)?')) {
  console.error('validate-basic-html: greeting matcher should allow hi sandra');
  process.exit(1);
}
if (!/@media print[\s\S]*?\.ba-split-lines/.test(stylesCss)) {
  console.error('validate-basic-html: print stylesheet must hide decorative ba-split-lines');
  process.exit(1);
}
if (!/@media print[\s\S]*?a\[href\^="#"]::after/.test(stylesCss)) {
  console.error('validate-basic-html: print stylesheet must suppress hash-link URL appendices');
  process.exit(1);
}
const taglineConst = gptJs.match(/const TAGLINE = '([^']+)';/);
if (taglineConst && /https?:\/\//i.test(taglineConst[1])) {
  console.error('validate-basic-html: TAGLINE must stay plain text without URLs');
  process.exit(1);
}

console.log('validate-basic-html: OK');
