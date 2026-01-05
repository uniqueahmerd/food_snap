import { Pool } from "pg";
import dotenv from "dotenv";
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
   ssl: {
    rejectUnauthorized: false, // allow self-signed cert
  },
});

pool.on("connect", () => console.log("✅ PostgreSQL connected"));
