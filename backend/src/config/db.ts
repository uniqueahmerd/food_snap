import { Pool } from "pg";
import dotenv from "dotenv"
// import {setupTables} from "./setupTables.ts"

dotenv.config();

export const pool = new Pool({ 
   host: process.env.DB_HOST,
  port: process.env.DB_PORT as any,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD, 
  database: process.env.DATABASE,
  ssl: {
    rejectUnauthorized: false,
  },
  // connectionString: process.env.DATABASE_URL 
});
pool.on("connect", () => console.log("database conected"))

