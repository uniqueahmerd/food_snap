// import fs from "fs";
// import path from "path";
// import { pool } from "./db.js"; // or ./db.js depending on your file
// import { fileURLToPath } from "url";

// // Fix __dirname for ES Modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// async function migrate() {
//   const dir = path.join(__dirname, "migrations");

//   const files = fs.readdirSync(dir).sort();

//   for (const file of files) {
//     const sql = fs.readFileSync(
//       path.join(dir, file),
//       "utf-8"
//     );

//     console.log("Running", file);
//     await pool.query(sql);
//   }

//   console.log("Migrations finished");
//   process.exit(0);
// }

// migrate();




import fs from "fs";
import path from "path";
import { pool } from "./db.js";
import { fileURLToPath } from "url";

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function migrate() {
  const dir = path.join(__dirname, "migrations");
  const files = fs.readdirSync(dir).sort();

  // Ensure migrations table exists
  await pool.query(`
    CREATE TABLE IF NOT EXISTS migrations (
      id SERIAL PRIMARY KEY,
      filename VARCHAR(255) UNIQUE,
      applied_at TIMESTAMP DEFAULT now()
    )
  `);

  // Get list of already applied migrations
  const { rows } = await pool.query("SELECT filename FROM migrations");
  const appliedFiles = rows.map(r => r.filename);

  for (const file of files) {
    if (appliedFiles.includes(file)) {
      console.log("Skipping already applied migration:", file);
      continue;
    }

    const sql = fs.readFileSync(path.join(dir, file), "utf-8");

    console.log("Running migration:", file);
    try {
      await pool.query(sql);
      await pool.query("INSERT INTO migrations (filename) VALUES ($1)", [file]);
    } catch (err) {
      console.error("Error running migration:", file);
      console.error(err);
      process.exit(1); // Stop if a migration fails
    }
  }

  console.log("Migrations finished");
  process.exit(0);
}

migrate();
