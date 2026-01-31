import fs from "fs";
import path from "path";
import { pool } from "./db.js"; // or ./db.js depending on your file
import { fileURLToPath } from "url";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const dir = path.join(__dirname, "migrations");

  const files = fs.readdirSync(dir).sort();

  for (const file of files) {
    const sql = fs.readFileSync(
      path.join(dir, file),
      "utf-8"
    );

    console.log("Running", file);
    await pool.query(sql);
  }

  console.log("Migrations finished");
  process.exit(0);
}

migrate();
