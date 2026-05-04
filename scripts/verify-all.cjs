/**
 * Local / CI: JSON-LD parse + syntax-check all JS entrypoints.
 */
const { execSync } = require('child_process');
const path = require('path');

const root = path.join(__dirname, '..');
process.chdir(root);

execSync('node scripts/validate-jsonld.cjs', { stdio: 'inherit' });
for (const f of ['assets/sandra-gpt.js', 'assets/script.js', 'api/sandra-gpt.js']) {
  execSync(`node --check ${f}`, { stdio: 'inherit' });
}
execSync('node scripts/validate-basic-html.cjs', { stdio: 'inherit' });
console.log('verify-all: OK');
