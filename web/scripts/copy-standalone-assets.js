const fs = require('fs');
const path = require('path');

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function findServerJsDirs(dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== '.next') {
        const fullPath = path.join(dir, entry.name);
        if (fs.existsSync(path.join(fullPath, 'server.js'))) {
          results.push(fullPath);
        }
        results = results.concat(findServerJsDirs(fullPath));
      }
    }
  } catch (e) {
    // ignore
  }
  return results;
}

const rootDir = path.join(__dirname, '..');
const standaloneDir = path.join(rootDir, '.next', 'standalone');

if (fs.existsSync(standaloneDir)) {
  console.log('Copying static & public assets into Next.js standalone directories...');
  const publicDir = path.join(rootDir, 'public');
  const staticDir = path.join(rootDir, '.next', 'static');

  // 1. Direct standalone root
  copyDirSync(publicDir, path.join(standaloneDir, 'public'));
  copyDirSync(staticDir, path.join(standaloneDir, '.next', 'static'));

  // 2. Also check all directories containing server.js
  const targetDirs = findServerJsDirs(standaloneDir);
  for (const targetDir of targetDirs) {
    console.log('Copying assets to nested standalone server dir:', targetDir);
    copyDirSync(publicDir, path.join(targetDir, 'public'));
    copyDirSync(staticDir, path.join(targetDir, '.next', 'static'));
  }

  console.log('✅ Standalone assets successfully copied.');
} else {
  console.log('Standalone directory not found, skipping asset copy.');
}
