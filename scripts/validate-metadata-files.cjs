/**
 * CI helper: validate robots.txt, sitemap.xml, and security.txt basics.
 */
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const SITE_ORIGIN = 'https://www.sandracai.com';

function read(name) {
  return fs.readFileSync(path.join(root, name), 'utf8');
}

function fail(message) {
  console.error(`validate-metadata-files: ${message}`);
  process.exit(1);
}

const robots = read('robots.txt');
if (!/^\s*User-agent:\s*\*/im.test(robots)) fail('robots.txt missing "User-agent: *"');
if (!/^\s*Allow:\s*\/\s*$/im.test(robots)) fail('robots.txt missing "Allow: /"');
if (!new RegExp(`^\\s*Sitemap:\\s*${SITE_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/sitemap\\.xml\\s*$`, 'im').test(robots)) {
  fail('robots.txt sitemap URL is missing or incorrect');
}

const sitemap = read('sitemap.xml');
if (!/<urlset\b[^>]*xmlns="http:\/\/www\.sitemaps\.org\/schemas\/sitemap\/0\.9"/i.test(sitemap)) {
  fail('sitemap.xml missing urlset namespace');
}
if (!new RegExp(`<loc>\\s*${SITE_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/\\s*</loc>`, 'i').test(sitemap)) {
  fail('sitemap.xml missing canonical home URL');
}
const lastmodMatch = sitemap.match(/<lastmod>\s*([^<]+?)\s*<\/lastmod>/i);
if (!lastmodMatch || !/^\d{4}-\d{2}-\d{2}$/.test(lastmodMatch[1])) {
  fail('sitemap.xml lastmod must be YYYY-MM-DD');
}
if (!/<changefreq>\s*monthly\s*<\/changefreq>/i.test(sitemap)) {
  fail('sitemap.xml changefreq must be monthly');
}
if (!/<priority>\s*1\.0\s*<\/priority>/i.test(sitemap)) {
  fail('sitemap.xml priority must be 1.0');
}

const security = read('.well-known/security.txt');
if (!/^\s*Contact:\s*mailto:[^\s]+@[^\s]+\s*$/im.test(security)) {
  fail('security.txt missing a valid Contact mailto');
}
if (!/sandraxcyj@gmail\.com/i.test(security)) {
  fail('security.txt Contact must use sandraxcyj@gmail.com');
}
if (!/^\s*Preferred-Languages:\s*en\s*$/im.test(security)) {
  fail('security.txt Preferred-Languages must be en');
}
if (!/^\s*Contact:\s*mailto:sandraxcyj@gmail\.com\s*$/im.test(security)) {
  fail('security.txt Contact must be exactly mailto:sandraxcyj@gmail.com');
}
if (!new RegExp(`^\\s*Canonical:\\s*${SITE_ORIGIN.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}/\\.well-known/security\\.txt\\s*$`, 'im').test(security)) {
  fail('security.txt canonical URL is missing or incorrect');
}

const expiresMatch = security.match(/^\s*Expires:\s*(\S+)/im);
if (!expiresMatch) {
  fail('security.txt missing Expires');
}
const expiresAt = Date.parse(expiresMatch[1]);
if (!Number.isFinite(expiresAt) || expiresAt <= Date.now()) {
  fail('security.txt Expires must be a future RFC 3339 timestamp');
}

const indexHtml = read('index.html');
const themeMeta = indexHtml.match(/<meta name="theme-color" content="([^"]+)"/);
if (!themeMeta) fail('index.html missing meta theme-color');

let manifest;
try {
  manifest = JSON.parse(read('site.webmanifest'));
} catch {
  fail('site.webmanifest is not valid JSON');
}
if (manifest.theme_color !== themeMeta[1]) {
  fail('site.webmanifest theme_color must match index.html meta theme-color');
}
if (manifest.background_color !== themeMeta[1]) {
  fail('site.webmanifest background_color must match index.html meta theme-color');
}

const metaDesc = indexHtml.match(/<meta name="description" content="([^"]+)"/);
if (!metaDesc) fail('index.html missing meta description');
if (!manifest.description || !metaDesc[1].startsWith(manifest.description)) {
  fail('site.webmanifest description must match the opening of meta description');
}
if (!/4\+ years/.test(manifest.description)) {
  fail('site.webmanifest description should mention 4+ years');
}
if (manifest.lang !== 'en-US') {
  fail('site.webmanifest lang must be en-US');
}
const inLanguageMatch = indexHtml.match(/"inLanguage":\s*"([^"]+)"/);
if (!inLanguageMatch) fail('index.html missing JSON-LD inLanguage');
if (manifest.lang !== inLanguageMatch[1]) {
  fail('site.webmanifest lang must match JSON-LD WebSite.inLanguage');
}
if (manifest.name !== 'Sandra Cai' || manifest.short_name !== 'Sandra Cai') {
  fail('site.webmanifest name and short_name must be Sandra Cai');
}
if (manifest.start_url !== '/') {
  fail('site.webmanifest start_url must be /');
}
if (manifest.display !== 'browser') {
  fail('site.webmanifest display must be browser');
}
if (!Array.isArray(manifest.icons) || manifest.icons.length < 3) {
  fail('site.webmanifest must include at least 3 icons');
}
if (!manifest.icons.some((icon) => /favicon-32\.png/i.test(icon.src))) {
  fail('site.webmanifest icons must include favicon-32.png');
}
if (!manifest.icons.some((icon) => /favicon-16\.png/i.test(icon.src))) {
  fail('site.webmanifest icons must include favicon-16.png');
}
if (!manifest.icons.some((icon) => /apple-touch-icon\.png/i.test(icon.src))) {
  fail('site.webmanifest icons must include apple-touch-icon.png');
}
if (manifest.icons.length !== 3) {
  fail('site.webmanifest should list exactly 3 icons (16, 32, apple-touch)');
}

const vercel = read('vercel.json');
let vercelJson;
try {
  vercelJson = JSON.parse(vercel);
} catch {
  fail('vercel.json is not valid JSON');
}
const headerRules = Array.isArray(vercelJson.headers) ? vercelJson.headers : [];
const assetRule = headerRules.find((r) => r.source === '/assets/(.*)');
const globalRule = headerRules.find((r) => r.source === '/(.*)');
if (!assetRule) fail('vercel.json missing /assets/(.*) header rule');
const assetCache = (assetRule.headers || []).find((h) => h.key === 'Cache-Control');
if (!assetCache || !/immutable/.test(assetCache.value)) {
  fail('vercel.json /assets Cache-Control should be long-lived and immutable');
}
if (!globalRule) fail('vercel.json missing global header rule');
const xFrameOptions = (globalRule.headers || []).find((h) => h.key === 'X-Frame-Options');
if (!xFrameOptions || xFrameOptions.value !== 'DENY') {
  fail('vercel.json missing X-Frame-Options: DENY');
}
const noSniff = (globalRule.headers || []).find((h) => h.key === 'X-Content-Type-Options');
if (!noSniff || noSniff.value !== 'nosniff') {
  fail('vercel.json missing X-Content-Type-Options: nosniff');
}
const referrerPolicy = (globalRule.headers || []).find((h) => h.key === 'Referrer-Policy');
if (!referrerPolicy || referrerPolicy.value !== 'strict-origin-when-cross-origin') {
  fail('vercel.json missing strict-origin-when-cross-origin Referrer-Policy');
}
const coop = (globalRule.headers || []).find((h) => h.key === 'Cross-Origin-Opener-Policy');
if (!coop || coop.value !== 'same-origin') {
  fail('vercel.json missing Cross-Origin-Opener-Policy: same-origin');
}
const permissionsPolicy = (globalRule.headers || []).find((h) => h.key === 'Permissions-Policy');
if (
  !permissionsPolicy ||
  !/camera=\(\)/.test(permissionsPolicy.value) ||
  !/microphone=\(\)/.test(permissionsPolicy.value) ||
  !/geolocation=\(\)/.test(permissionsPolicy.value)
) {
  fail('vercel.json Permissions-Policy must disable camera, microphone, and geolocation');
}
const hsts = (globalRule.headers || []).find((h) => h.key === 'Strict-Transport-Security');
if (
  !hsts ||
  !/max-age=63072000/.test(hsts.value) ||
  !/includeSubDomains/.test(hsts.value) ||
  !/preload/.test(hsts.value)
) {
  fail('vercel.json Strict-Transport-Security must use two years, subdomains, and preload');
}
const metaRule = headerRules.find((r) => r.source === '/(site.webmanifest|robots.txt|sitemap.xml)');
if (!metaRule) fail('vercel.json missing metadata files cache header rule');
const metaCache = (metaRule.headers || []).find((h) => h.key === 'Cache-Control');
if (!metaCache || !/max-age=3600/.test(metaCache.value)) {
  fail('vercel.json metadata Cache-Control should use max-age=3600');
}

const csp = (globalRule.headers || []).find((h) => h.key === 'Content-Security-Policy');
if (!csp || !/default-src 'self'/.test(csp.value)) {
  fail('vercel.json missing Content-Security-Policy with default-src self');
}
if (!csp || !/frame-ancestors 'none'/.test(csp.value)) {
  fail('vercel.json CSP must include frame-ancestors none');
}
if (!/base-uri 'self'/.test(csp.value) || !/form-action 'self'/.test(csp.value)) {
  fail('vercel.json CSP must restrict base-uri and form-action to self');
}

const apiRule = headerRules.find((r) => r.source === '/api/(.*)');
if (!apiRule) fail('vercel.json missing /api/(.*) header rule');
const apiCache = (apiRule.headers || []).find((h) => h.key === 'Cache-Control');
if (!apiCache || apiCache.value !== 'no-store') {
  fail('vercel.json /api Cache-Control must be no-store');
}

console.log('validate-metadata-files: OK');
