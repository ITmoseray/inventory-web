const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.resolve(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) { 
      if (!file.includes('node_modules') && !file.includes('.next')) {
        results = results.concat(walk(file));
      }
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('c:/Users/ProTech/OneDrive/Desktop/Developer/inventory/web/src');
let changedFiles = 0;

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let originalContent = content;
  
  content = content.replace(/className=(?:\"([^\"]+)\"|\'([^\']+)\'|\{([^\}]+)\})/g, (match, p1, p2, p3) => {
    let classes = p1 || p2 || p3;
    if (!classes) return match;
    
    let isDynamic = !!p3;
    let textToProcess = isDynamic ? p3 : classes;
    
    if (textToProcess.match(/text-(slate|gray|zinc|neutral)-(800|900|950)|text-black/)) {
      if (!textToProcess.match(/dark:text-/)) {
        let hasLightBg = textToProcess.match(/bg-(white|slate-50|slate-100|gray-50|gray-100)/);
        let hasDarkBg = textToProcess.match(/dark:bg-/);
        
        if (hasLightBg && !hasDarkBg) {
          return match;
        } else {
          if (isDynamic) {
             let newText = textToProcess.replace(/(text-(?:slate|gray|zinc|neutral)-(?:800|900|950)|text-black)/g, '$1 dark:text-white');
             return 'className={' + newText + '}';
          } else {
             let newText = classes.replace(/(text-(?:slate|gray|zinc|neutral)-(?:800|900|950)|text-black)/g, '$1 dark:text-white');
             return p1 ? 'className="' + newText + '"' : "className='" + newText + "'";
          }
        }
      }
    }
    return match;
  });

  if (content !== originalContent) {
    fs.writeFileSync(file, content, 'utf8');
    changedFiles++;
  }
});

console.log('Fixed ' + changedFiles + ' files.');
