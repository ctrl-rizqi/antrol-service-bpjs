import "dotenv/config";
import express, { Application, Request, Response, NextFunction } from "express";
import cors from "cors";
import prisma from "./lib/prisma";
import { khanzaDb } from "./khanza/khanza.client";
import {
  authenticateToken,
  requirePermission,
  AuthRequest,
} from "./middleware/auth";
// dotenv

process.env.TZ = "Asia/Jakarta";
process.env.TZ = process.env.TZ || "Asia/Jakarta";

// controller
import adminRouter from "./api/admin";
import poliRouter from "./api/poli";
import categoryRouter from "./api/category";
import taskId from "./api/task-id";
import authRouter from "./api/auth";

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

  // Start Poller Scheduler (pull from Khanza to DB) - selalu berjalan
  startPollerScheduler();

  // Queue Sender Toggle - berdasarkan environment variable
  // true = pengiriman otomatis ke API BPJS (ON)
  // false = pengiriman manual via API (OFF) - DEFAULT
  const isQueueSenderEnabled = process.env.QUEUE_SENDER_ENABLED === "true";
  if (isQueueSenderEnabled) {
    startQueuePoller();
    console.log("Queue Sender: AUTO (enabled)");
  } else {
    console.log("Queue Sender: MANUAL (disabled - gunakan API /api/admin/visit-event/resend)");
  }

  const app: Application = express();
  const PORT = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  app.get("/", (req: Request, res: Response) => {
    res.send("Hello, World!");
  });

  app.use("/api/auth", authRouter);

  const routePermissionMap: Record<string, string> = {
    "/api/admin": "admin:access",
    "/api/poli": "poli:access",
    "/api/category": "category:access",
    "/api/task-id": "task-id:access",
  };

  const protectRoute = (path: string) => {
    return (req: Request, res: Response, next: NextFunction) => {
      const authReq = req as AuthRequest;
      const user = authReq.user;

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required",
        });
      }

      if (user.role === "admin") {
        return next();
      }

      const permission = routePermissionMap[path];
      const permissions = user.permissions || [];

      if (
        permission &&
        !permissions.includes(permission) &&
        !permissions.includes("*")
      ) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Required permission: ${permission}`,
        });
      }

      next();
    };
  };

  app.use(
    "/api/admin",
    authenticateToken,
    protectRoute("/api/admin"),
    adminRouter,
  );
  app.use(
    "/api/poli",
    authenticateToken,
    protectRoute("/api/poli"),
    poliRouter,
  );
  app.use(
    "/api/category",
    authenticateToken,
    protectRoute("/api/category"),
    categoryRouter,
  );
  app.use(
    "/api/task-id",
    authenticateToken,
    protectRoute("/api/task-id"),
    taskId,
  );

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
