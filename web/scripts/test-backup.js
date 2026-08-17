require('dotenv').config();
const { execSync } = require('child_process');
const path = require('path');

let url = process.env.DATABASE_URL;
console.log('Original URL:', url);

// Strip parameters pg_dump doesn't understand
url = url
  .replace('sslmode=verify-full', 'sslmode=require')
  .replace('&channel_binding=require', '');

console.log('Cleaned URL:', url);

const outFile = path.join(process.cwd(), '../backups/test2.sql');
const cmd = `pg_dump --clean --if-exists --no-owner --no-privileges -d "${url}" -f "${outFile}"`;
console.log('Running:', cmd);

try {
  execSync(cmd, { stdio: 'inherit' });
  console.log('SUCCESS: Backup created at', outFile);
} catch (e) {
  console.error('FAILED:', e.message);
}
