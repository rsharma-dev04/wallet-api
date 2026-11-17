
import express from "express";

import { sql, initDB } from "./config/db.js";
import ratelimiter from "./middleware/ratelimiter.js";
import transactionsRoute from "./routes/transactionsRoute.js";

import dotenv from "dotenv";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const backendDirectory = dirname(fileURLToPath(import.meta.url));

// Load backend environment variables
dotenv.config({
  path: resolve(backendDirectory, ".env"),
});

const app = express();

const PORT = Number(process.env.PORT) || 5001;

// Middleware
app.use(express.json());

// Home Route
app.get("/", (req, res) => {
  return res.status(200).send("Server is working!");
});

// Database Connection Check
app.get("/db", async (req, res) => {
  try {
    const [row] = await sql`
      SELECT NOW() AS current_time
    `;

    return res.status(200).json({
      database: "connected",
      currentTime: row.current_time,
    });
  } catch (error) {
    console.error("Database connection error:", error);

    return res.status(503).json({
      message: "Database unavailable",
    });
  }
});

// Rate Limiter Middleware
app.use("/api", rateLimiter);

// Transaction Routes
app.use("/api/transactions", transactionsRoute);

// Start Server
async function startServer() {
  try {
    await initDB();

    const server = app.listen(PORT, () => {
      console.log(
        `Server is up and running on PORT: ${PORT}`
      );
    });

    server.on("error", (error) => {
      if (error.code === "EADDRINUSE") {
        console.error(
          `Port ${PORT} is already in use.`
        );
      } else {
        console.error("Server error:", error);
      }

      process.exit(1);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();