const fs = require('fs');
const path = require('path');

function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(walk(file));
        } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
            results.push(file);
        }
    });
    return results;
}

const files = walk('./web/src/app/(dashboard)');
let changedFiles = 0;

files.forEach(file => {
    let content = fs.readFileSync(file, 'utf8');
    let orig = content;
    
    // Find class strings
    content = content.replace(/className=(["'`])(.*?)\1/g, (match, quote, classes) => {
        let newClasses = classes;
        
        if (newClasses.includes('text-slate-900') && !newClasses.includes('dark:text-white') && !newClasses.includes('dark:text-slate')) {
            newClasses = newClasses.replace('text-slate-900', 'text-slate-900 dark:text-white');
        }
        if (newClasses.includes('text-slate-800') && !newClasses.includes('dark:text-white') && !newClasses.includes('dark:text-slate')) {
            newClasses = newClasses.replace('text-slate-800', 'text-slate-800 dark:text-white');
        }
        if (newClasses.includes('bg-white') && !newClasses.includes('dark:bg-')) {
            newClasses = newClasses.replace('bg-white', 'bg-white dark:bg-slate-950');
        }
        if (newClasses.includes('bg-slate-50') && !newClasses.includes('dark:bg-')) {
            newClasses = newClasses.replace('bg-slate-50', 'bg-slate-50 dark:bg-slate-900/50');
        }
        
        return `className=${quote}${newClasses}${quote}`;
    });

    if (content !== orig) {
        fs.writeFileSync(file, content);
        changedFiles++;
    }
});

console.log(`Fixed contrast in ${changedFiles} files.`);
