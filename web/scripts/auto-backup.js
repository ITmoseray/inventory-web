const { exec } = require("child_process");
const util = require("util");
const fs = require("fs");
const path = require("path");
const execAsync = util.promisify(exec);

// Load environment variables if running locally
require("dotenv").config({ path: path.join(__dirname, "../.env") });

const BACKUPS_DIR = path.join(__dirname, "../../backups");

async function runAutoBackup() {
  console.log(`[AUTO-BACKUP] Starting automated database backup at ${new Date().toISOString()}`);
  
  try {
    if (!fs.existsSync(BACKUPS_DIR)) {
      fs.mkdirSync(BACKUPS_DIR, { recursive: true });
    }

    const timestampStr = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `auto-backup-${timestampStr}.sql`;
    const filePath = path.join(BACKUPS_DIR, filename);

    const dbUrl = process.env.DATABASE_URL;
    if (!dbUrl) {
      throw new Error("DATABASE_URL is not defined in environment variables");
    }

    const command = `pg_dump --clean --if-exists --no-owner --no-privileges -d "${dbUrl}" -f "${filePath}"`;
    
    await execAsync(command);
    
    console.log(`[AUTO-BACKUP] Successfully generated ${filename}`);
    
    // Optional: Keep only the last 7 auto-backups to save disk space
    cleanupOldBackups(7);
    
    process.exit(0);
  } catch (error) {
    console.error("[AUTO-BACKUP] Failed:", error);
    process.exit(1);
  }
}

function cleanupOldBackups(keepCount) {
  try {
    const files = fs.readdirSync(BACKUPS_DIR);
    const autoBackups = files
      .filter(f => f.startsWith("auto-backup-") && f.endsWith(".sql"))
      .map(filename => ({
        filename,
        filepath: path.join(BACKUPS_DIR, filename),
        time: fs.statSync(path.join(BACKUPS_DIR, filename)).birthtime.getTime()
      }))
      .sort((a, b) => b.time - a.time); // Newest first

    if (autoBackups.length > keepCount) {
      const toDelete = autoBackups.slice(keepCount);
      for (const file of toDelete) {
        fs.unlinkSync(file.filepath);
        console.log(`[AUTO-BACKUP] Deleted old backup: ${file.filename}`);
      }
    }
  } catch (error) {
    console.error("[AUTO-BACKUP] Cleanup failed:", error);
  }
}

runAutoBackup();
