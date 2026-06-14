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

const security = read('.well-known/security.txt');
if (!/^\s*Contact:\s*mailto:[^\s]+@[^\s]+\s*$/im.test(security)) {
  fail('security.txt missing a valid Contact mailto');
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
const coop = (globalRule.headers || []).find((h) => h.key === 'Cross-Origin-Opener-Policy');
if (!coop || coop.value !== 'same-origin') {
  fail('vercel.json missing Cross-Origin-Opener-Policy: same-origin');
}
const metaRule = headerRules.find((r) => r.source === '/(site.webmanifest|robots.txt|sitemap.xml)');
if (!metaRule) fail('vercel.json missing metadata files cache header rule');
const metaCache = (metaRule.headers || []).find((h) => h.key === 'Cache-Control');
if (!metaCache || !/max-age=3600/.test(metaCache.value)) {
  fail('vercel.json metadata Cache-Control should use max-age=3600');
}

const apiRule = headerRules.find((r) => r.source === '/api/(.*)');
if (!apiRule) fail('vercel.json missing /api/(.*) header rule');
const apiCache = (apiRule.headers || []).find((h) => h.key === 'Cache-Control');
if (!apiCache || apiCache.value !== 'no-store') {
  fail('vercel.json /api Cache-Control must be no-store');
}

console.log('validate-metadata-files: OK');
