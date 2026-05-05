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

console.log('validate-metadata-files: OK');
