// Run before every push that changes the app: node scripts/release.cjs
// Bumps the version in docs/js/version.js, docs/version.json and docs/sw.js together, so phones
// download fresh files and offer "Aktualizuj".
const fs = require('fs');
const path = require('path');
const d = (f) => path.join(__dirname, '..', 'docs', f);
const cur = JSON.parse(fs.readFileSync(d('version.json'), 'utf8')).v;
const v = cur + 1;
fs.writeFileSync(d('version.json'), JSON.stringify({ v }) + '\n');
fs.writeFileSync(d('js/version.js'), fs.readFileSync(d('js/version.js'), 'utf8').replace(/APP_VERSION = \d+/, `APP_VERSION = ${v}`));
fs.writeFileSync(d('sw.js'), fs.readFileSync(d('sw.js'), 'utf8').replace(/const VERSION = 'nutka-v\d+'/, `const VERSION = 'nutka-v${v}'`));
console.log(`Wersja ${cur} → ${v}`);
