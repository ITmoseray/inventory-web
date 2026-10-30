const fs = require('fs');
const path = require('path');

const files = [
  'node_modules/next/dist/build/webpack/plugins/next-trace-entrypoints-plugin.js',
  'node_modules/next/dist/esm/build/webpack/plugins/next-trace-entrypoints-plugin.js',
  'node_modules/next/dist/build/collect-build-traces.js',
  'node_modules/next/dist/esm/build/collect-build-traces.js'
];

for (const rel of files) {
  const full = path.join(__dirname, '..', rel);
  if (!fs.existsSync(full)) continue;
  let content = fs.readFileSync(full, 'utf8');
  if (content.includes("e.code === 'UNKNOWN'")) {
    content = content.replaceAll(
      "e.code === 'UNKNOWN'",
      "e.code === 'UNKNOWN' || e.code === 'EISDIR'"
    );
    fs.writeFileSync(full, content, 'utf8');
    console.log('Patched exFAT readlink support in:', rel);
  }
}
