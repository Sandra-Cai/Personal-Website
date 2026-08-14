/**
 * Local / CI: JSON-LD parse + syntax-check all JS entrypoints.
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
process.chdir(root);

execSync('node scripts/validate-jsonld.cjs', { stdio: 'inherit' });
for (const f of [
  'assets/sandra-gpt.js',
  'assets/script.js',
  'api/sandra-gpt.js',
  'scripts/validate-jsonld.cjs',
  'scripts/validate-basic-html.cjs',
  'scripts/validate-metadata-files.cjs',
  'scripts/verify-all.cjs',
]) {
  execSync(`node --check ${f}`, { stdio: 'inherit' });
}
execSync('node scripts/validate-basic-html.cjs', { stdio: 'inherit' });
execSync('node scripts/validate-metadata-files.cjs', { stdio: 'inherit' });
console.log('verify-all: OK');
