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

// Patch lucide-react CommonJS to guard React.createContext in RSC environment
const lucidePath = path.join(__dirname, '..', 'node_modules/lucide-react/dist/cjs/lucide-react.js');
if (fs.existsSync(lucidePath)) {
  let content = fs.readFileSync(lucidePath, 'utf8');
  if (content.includes('const LucideContext = react.createContext({});')) {
    content = content.replace(
      'const LucideContext = react.createContext({});',
      'const LucideContext = (typeof react.createContext === "function") ? react.createContext({}) : null;'
    );
    content = content.replace(
      'const useLucideContext = () => react.useContext(LucideContext);',
      'const useLucideContext = () => ((LucideContext && typeof react.useContext === "function") ? react.useContext(LucideContext) : {});'
    );
    fs.writeFileSync(lucidePath, content, 'utf8');
    console.log('Patched lucide-react for React Server Components support');
  }
}
