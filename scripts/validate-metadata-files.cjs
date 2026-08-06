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
if (!/^\s*Disallow:\s*\/api\/\s*$/im.test(robots)) fail('robots.txt missing "Disallow: /api/"');
if (!/^\s*Allow:\s*\/\s*$/im.test(robots)) fail('robots.txt missing "Allow: /"');
const allowIdx = robots.search(/^\s*Allow:\s*\/\s*$/im);
const disallowIdx = robots.search(/^\s*Disallow:\s*\/api\/\s*$/im);
if (allowIdx < 0 || disallowIdx < 0 || allowIdx > disallowIdx) {
  fail('robots.txt should Allow / before Disallow /api/');
}
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
const lastmod = lastmodMatch[1];
const todayUtc = new Date().toISOString().slice(0, 10);
if (lastmod > todayUtc) {
  fail('sitemap.xml lastmod must not be in the future');
}
const lastmodMs = Date.parse(`${lastmod}T00:00:00Z`);
const todayMs = Date.parse(`${todayUtc}T00:00:00Z`);
if (!Number.isFinite(lastmodMs) || todayMs - lastmodMs > 1000 * 60 * 60 * 24 * 14) {
  fail('sitemap.xml lastmod should be within the last 14 days');
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
if (expiresAt - Date.now() < 1000 * 60 * 60 * 24 * 30) {
  fail('security.txt Expires should be at least 30 days in the future');
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
if (!Array.isArray(manifest.icons) || manifest.icons.length < 4) {
  fail('site.webmanifest must include at least 4 icons');
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
if (!manifest.icons.some((icon) => /icon-512\.png/i.test(icon.src))) {
  fail('site.webmanifest icons must include icon-512.png');
}
if (!fs.existsSync(path.join(root, 'assets', 'icon-512.png'))) {
  fail('assets/icon-512.png must exist for the web manifest');
}
if (manifest.icons.length !== 4) {
  fail('site.webmanifest should list exactly 4 icons (16, 32, apple-touch, 512)');
}
if (!manifest.icons.every((icon) => icon.type === 'image/png')) {
  fail('site.webmanifest icons must all be type image/png');
}
if (!manifest.icons.some((icon) => icon.sizes === '180x180')) {
  fail('site.webmanifest must include a 180x180 apple-touch icon size');
}
if (!manifest.icons.some((icon) => icon.sizes === '512x512')) {
  fail('site.webmanifest must include a 512x512 icon size');
}
if (!manifest.icons.every((icon) => /\?v=\d+/.test(icon.src))) {
  fail('site.webmanifest icon src values must include a ?v= cache buster');
}
if (!manifest.icons.every((icon) => icon.purpose === 'any')) {
  fail('site.webmanifest icons must declare purpose any');
}
const faviconV = indexHtml.match(/favicon-32\.png\?v=(\d+)/);
const manifest32 = manifest.icons.find((icon) => /favicon-32\.png/i.test(icon.src));
if (!faviconV || !manifest32 || !manifest32.src.includes(`?v=${faviconV[1]}`)) {
  fail('site.webmanifest favicon-32 cache version must match index.html');
}
if (!/^#[0-9A-Fa-f]{6}$/.test(manifest.theme_color || '')) {
  fail('site.webmanifest theme_color must be a 6-digit hex color');
}
if (manifest.background_color !== manifest.theme_color) {
  fail('site.webmanifest background_color must match theme_color');
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
for (const source of ['/assets/social-card.jpg', '/assets/sandra-headshot.jpg']) {
  const rule = headerRules.find((r) => r.source === source);
  if (!rule) fail(`vercel.json missing short-cache rule for ${source}`);
  const cache = (rule.headers || []).find((h) => h.key === 'Cache-Control');
  if (!cache || !/max-age=86400/.test(cache.value) || !/must-revalidate/.test(cache.value)) {
    fail(`vercel.json ${source} must use max-age=86400 must-revalidate`);
  }
  const assetIdx = headerRules.indexOf(assetRule);
  const ruleIdx = headerRules.indexOf(rule);
  if (ruleIdx < 0 || assetIdx < 0 || ruleIdx > assetIdx) {
    fail(`vercel.json ${source} cache rule must appear before /assets/(.*) immutable rule`);
  }
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
  !/geolocation=\(\)/.test(permissionsPolicy.value) ||
  !/payment=\(\)/.test(permissionsPolicy.value) ||
  !/usb=\(\)/.test(permissionsPolicy.value) ||
  !/interest-cohort=\(\)/.test(permissionsPolicy.value) ||
  !/browsing-topics=\(\)/.test(permissionsPolicy.value)
) {
  fail('vercel.json Permissions-Policy must disable camera, mic, geo, payment, usb, interest-cohort, browsing-topics');
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
const securityRule = headerRules.find((r) => r.source === '/.well-known/security.txt');
if (!securityRule) fail('vercel.json missing /.well-known/security.txt cache header rule');
const securityCache = (securityRule.headers || []).find((h) => h.key === 'Cache-Control');
if (!securityCache || !/max-age=3600/.test(securityCache.value)) {
  fail('vercel.json security.txt Cache-Control should use max-age=3600');
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
if (!/script-src 'self'/.test(csp.value) || !/connect-src 'self'/.test(csp.value)) {
  fail('vercel.json CSP must keep script-src and connect-src on self');
}
if (!/img-src 'self' data:/.test(csp.value) || !/font-src 'self'/.test(csp.value)) {
  fail('vercel.json CSP must allow self fonts and self/data images');
}
if (!/style-src 'self' 'unsafe-inline'/.test(csp.value)) {
  fail("vercel.json CSP style-src must allow self and unsafe-inline");
}
if (!/object-src 'none'/.test(csp.value)) {
  fail("vercel.json CSP must include object-src 'none'");
}

const htmlCacheSources = ['/', '/404', '/index.html', '/404.html'];
for (const source of htmlCacheSources) {
  const rule = headerRules.find((r) => r.source === source);
  if (!rule) fail(`vercel.json missing HTML Cache-Control rule for ${source}`);
  const cache = (rule.headers || []).find((h) => h.key === 'Cache-Control');
  if (!cache || !/max-age=0/.test(cache.value) || !/must-revalidate/.test(cache.value)) {
    fail(`vercel.json ${source} Cache-Control must be max-age=0 must-revalidate`);
  }
}

const apiRule = headerRules.find((r) => r.source === '/api/(.*)');
if (!apiRule) fail('vercel.json missing /api/(.*) header rule');
const apiCache = (apiRule.headers || []).find((h) => h.key === 'Cache-Control');
if (!apiCache || apiCache.value !== 'no-store') {
  fail('vercel.json /api Cache-Control must be no-store');
}

let pkg;
try {
  pkg = JSON.parse(read('package.json'));
} catch {
  fail('package.json is not valid JSON');
}
if (!pkg.engines || !pkg.engines.node || !/>=18/.test(String(pkg.engines.node))) {
  fail('package.json engines.node must require >=18');
}
if (!pkg.scripts || pkg.scripts.verify !== 'node scripts/verify-all.cjs') {
  fail('package.json verify script must run scripts/verify-all.cjs');
}

const ciYml = read('.github/workflows/ci.yml');
if (!/npm run verify/.test(ciYml)) {
  fail('.github/workflows/ci.yml must run npm run verify');
}
if (!/node-version:\s*'20'/.test(ciYml)) {
  fail(".github/workflows/ci.yml must use Node 20");
}
if (!/permissions:\s*\n\s*contents:\s*read/.test(ciYml)) {
  fail('.github/workflows/ci.yml must set permissions.contents to read');
}
if (!/actions\/checkout@[0-9a-f]{40}/.test(ciYml) || !/actions\/setup-node@[0-9a-f]{40}/.test(ciYml)) {
  fail('.github/workflows/ci.yml must pin checkout and setup-node to full commit SHAs');
}

const requiredAssets = [
  'assets/social-card.jpg',
  'assets/sandra-headshot.jpg',
  'assets/favicon.ico',
  'assets/favicon-16.png',
  'assets/favicon-32.png',
  'assets/apple-touch-icon.png',
  'assets/icon-512.png',
];
for (const rel of requiredAssets) {
  if (!fs.existsSync(path.join(root, rel))) {
    fail(`missing required asset file: ${rel}`);
  }
}

function pngSize(buf) {
  if (buf.length < 24 || buf[0] !== 0x89 || buf[1] !== 0x50) return null;
  return { width: buf.readUInt32BE(16), height: buf.readUInt32BE(20) };
}

function jpegSize(buf) {
  if (buf.length < 4 || buf[0] !== 0xff || buf[1] !== 0xd8) return null;
  let i = 2;
  while (i + 9 < buf.length) {
    if (buf[i] !== 0xff) return null;
    const marker = buf[i + 1];
    if (marker === 0xd9 || marker === 0xda) break;
    const len = buf.readUInt16BE(i + 2);
    if (len < 2) return null;
    if (marker >= 0xc0 && marker <= 0xc3) {
      return { height: buf.readUInt16BE(i + 5), width: buf.readUInt16BE(i + 7) };
    }
    i += 2 + len;
  }
  return null;
}

function assertImageSize(rel, expectedW, expectedH) {
  const buf = fs.readFileSync(path.join(root, rel));
  if (buf.length < 100) fail(`${rel} looks empty or truncated`);
  const size = /\.png$/i.test(rel) ? pngSize(buf) : jpegSize(buf);
  if (!size) fail(`could not read dimensions for ${rel}`);
  if (size.width !== expectedW || size.height !== expectedH) {
    fail(`${rel} must be ${expectedW}x${expectedH} (got ${size.width}x${size.height})`);
  }
}

assertImageSize('assets/social-card.jpg', 1200, 630);
assertImageSize('assets/sandra-headshot.jpg', 930, 1024);
assertImageSize('assets/icon-512.png', 512, 512);

console.log('validate-metadata-files: OK');
