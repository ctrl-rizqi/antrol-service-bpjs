import "dotenv/config";
import express, { Application, Request, Response } from "express";
import cors from "cors";
import prisma from "./lib/prisma";
import { khanzaDb } from "./khanza/khanza.client";
// dotenv

process.env.TZ = "Asia/Jakarta";
process.env.TZ = process.env.TZ || "Asia/Jakarta";

// controller
import adminRouter from "./api/admin";
import poliRouter from "./api/poli";

// Scheduler JOB
import { startPollerScheduler } from "./job/poller.scheduler";
import { startQueuePoller } from "./job/queue.sheduler";

// Tambahkan ini untuk mengatasi masalah serialisasi BigInt
(BigInt.prototype as any).toJSON = function () {
  return this.toString();
};

// Check Database Connection
async function checkDatabaseConnection() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("Database service is connected. ✅");
  } catch (error) {
    console.error("Database connection failed:", error);
    process.exit(1);
  }
}

// Check Database SIMRS
async function checkDatabaseSIMRS() {
  try {
    await khanzaDb.query(`SELECT 1`);
    console.log("Database SIMRS is connected. ✅");
  } catch (error) {
    console.error("Database SIMRS connection failed:", error);
    process.exit(1);
  }
}

(async () => {
  await checkDatabaseConnection();
  await checkDatabaseSIMRS();

  // Start Poller Scheduler
  startPollerScheduler();
  // Start Queue Poller
  startQueuePoller();

  const app: Application = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
  });

  app.use("/api/admin", adminRouter);
  app.use("/api/poli", poliRouter);

  process.on("uncaughtException", async (err) => {
    await prisma.$disconnect();
    console.error("Uncaught Exception:", err);
    process.exit(1);
  });

  process.on("SIGINT", async () => {
    await prisma.$disconnect();
    console.log("SIGINT received. Shutting down gracefully...");
    process.exit(0);
  });

  process.on("SIGTERM", async () => {
    await prisma.$disconnect();

    console.log("SIGTERM received. Shutting down gracefully...");
    process.exit(0);
  });

  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
})();
