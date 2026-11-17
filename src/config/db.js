import { neon } from "@neondatabase/serverless";
import dotenv from "dotenv";
import { fileURLToPath } from "node:url";

// Load backend/.env
dotenv.config({
  path: fileURLToPath(
    new URL("../../.env", import.meta.url)
  ),
});

// Load project root .env.local
dotenv.config({
  path: fileURLToPath(
    new URL("../../../.env.local", import.meta.url)
  ),
});

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is missing");
}

export const sql = neon(process.env.DATABASE_URL);

export async function initDB() {
  try {
    await sql`
      CREATE TABLE IF NOT EXISTS transactions (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        title VARCHAR(255) NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        category VARCHAR(255) NOT NULL,
        created_at DATE NOT NULL DEFAULT CURRENT_DATE
      )
    `;

    console.log("Database initialized successfully.");
  } catch (error) {
    console.error("Error initializing database:", error);
    throw error;
  }
}
