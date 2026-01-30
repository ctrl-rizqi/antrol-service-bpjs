// Admin controller berisikan logika untuk mengelola data admin
import { Router } from "express";
import type { Request, Response } from "express";
import prisma, { Prisma } from "../lib/prisma";
import { paginate } from "../utils/pagination";
import { fetchRegistrationByNoReg } from "../khanza/khanza.query";
import { checkTaskId, processRegistrationRow } from "../poller/registration";
import { processRegistrationTask, processUpdateTask } from "../poller/queue";
import { updateDateCursor } from "../domain/cursors";

const router: Router = Router();

// Mengambil semua VisitEvent dan beserta statusnya
router.get("/visit-event", async (req: Request, res: Response) => {
  const search = req.query.search as string;
  const startDate = req.query.startDate as string;
  const endDate = req.query.endDate as string;

  const where: Prisma.VisitEventWhereInput = {};

  if (search) {
    where.OR = [
      { visit_id: { contains: search } },
      { no_rkm_medis: { contains: search } },
      { nomor_antrean: { contains: search } },
    ];
  }

  if (startDate || endDate) {
    where.tanggal = {};
    if (startDate) {
      where.tanggal.gte = new Date(startDate);
    }
    if (endDate) {
      const end = new Date(endDate);
      if (endDate.length === 10) end.setUTCHours(23, 59, 59, 999);
      where.tanggal.lte = end;
    }
  }

  try {
    const paginatedVisitEvents = await paginate(prisma.visitEvent, req, {
      where,
      include: {
        EventTasks: true,
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    res.json({
      success: true,
      ...paginatedVisitEvents,
    });
  } catch (error) {
    console.error("Failed to fetch validation issues:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch validation issues",
      error: (error as Error).message,
    });
  }
});

// Validasi manual pengiriman antrol
router.post("/visit-event/revalidate", async (req: Request, res: Response) => {
  const { kodebooking: noRawat } = req.body || {};

  if (typeof noRawat !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid registration number format.",
    });
  }

  try {
    // 1. Fetch fresh data from Khanza using no_reg
    const khanzaRow = await fetchRegistrationByNoReg(noRawat);
    if (!khanzaRow) {
      return res.status(404).json({
        success: false,
        message: `Registration with no_reg ${noRawat} not found in Khanza.`,
      });
    }

    const { no_rawat: visitId } = khanzaRow;

    // 2. Delete existing VisitEvent and its tasks (cascade)
    const existingEvent = await prisma.visitEvent.findUnique({
      where: { visit_id: visitId },
    });

    if (existingEvent) {
      await prisma.visitEvent.delete({ where: { visit_id: visitId } });
      console.log(`[REVALIDATE] Deleted existing VisitEvent: ${visitId}`);
    }

    // 3. Reprocess the row as if it's new
    console.log(`[REVALIDATE] Reprocessing row for visit_id: ${visitId}`);
    const taskProgress = await checkTaskId(khanzaRow);
    await processRegistrationRow(khanzaRow, taskProgress);

    // 4. Fetch the newly created event to return it in the response
    const newEvent = await prisma.visitEvent.findUnique({
      where: { visit_id: visitId },
      include: { EventTasks: true },
    });

    res.json({
      success: true,
      message: `Successfully revalidated visit ${visitId}.`,
      data: newEvent,
    });
  } catch (error) {
    console.error(
      `Failed to revalidate visit_id for no_reg ${noRawat}:`,
      error,
    );
    return res.status(500).json({
      success: false,
      message: `Failed to revalidate visit_id for no_reg ${noRawat}`,
      error: (error as Error).message,
    });
  }
});

// melihat status task berdasarkan id visitevent
router.get("/visit-event/:id/tasks", async (req: Request, res: Response) => {
  const { id } = req.params;

  try {
    const visitEvent = await prisma.visitEvent.findUnique({
      where: { id: Number(id) },
      include: { EventTasks: true },
    });

    if (!visitEvent) {
      return res.status(404).json({
        success: false,
        message: `VisitEvent with id ${id} not found.`,
      });
    }

    res.json({
      success: true,
      data: visitEvent,
    });
  } catch (error) {
    console.error(`Failed to fetch tasks for visit_id ${id}:`, error);
    return res.status(500).json({
      success: false,
      message: `Failed to fetch tasks for visit_id ${id}`,
      error: (error as Error).message,
    });
  }
});

// mengirimkan ulang task berdasarkan id visitevent
router.post("/visit-event/resend", async (req: Request, res: Response) => {
  // Kodebooking atau visit_id
  const { kodebooking: noRawat } = req.body || {};

  if (typeof noRawat !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid registration number format.",
    });
  }

  try {
    // Fetch visit event with tasks
    const visitEvent = await prisma.visitEvent.findUnique({
      where: { visit_id: noRawat },
      include: {
        EventTasks: {
          orderBy: { task_id: "asc" },
        },
      },
    });

    if (!visitEvent) {
      return res.status(404).json({
        success: false,
        message: `VisitEvent with visit_id ${noRawat} not found.`,
      });
    }

    // Process tasks sequentially
    for (const task of visitEvent.EventTasks) {
      // Refetch to ensure we have latest state for dependency checks
      const currentVisitEvent = await prisma.visitEvent.findUnique({
        where: { id: visitEvent.id },
        include: { EventTasks: true },
      });

      if (!currentVisitEvent) continue;

      const currentTask = currentVisitEvent.EventTasks.find(
        (t) => t.id === task.id,
      );
      if (!currentTask) continue;

      const taskWithContext = {
        ...currentTask,
        VisitEvent: currentVisitEvent,
      };

      if (currentTask.task_id === 0) {
        await processRegistrationTask(taskWithContext, true);
      } else if ([3, 4, 5, 6, 7].includes(currentTask.task_id)) {
        await processUpdateTask(taskWithContext, true);
      }
    }

    // Fetch final state
    const finalEvent = await prisma.visitEvent.findUnique({
      where: { visit_id: noRawat },
      include: { EventTasks: true },
    });

    res.json({
      success: true,
      message: `Successfully triggered resend for visit ${noRawat}.`,
      data: finalEvent,
    });
  } catch (error) {
    console.error(`Failed to resend visit_id ${noRawat}:`, error);
    return res.status(500).json({
      success: false,
      message: `Failed to resend visit_id ${noRawat}`,
      error: (error as Error).message,
    });
  }
});

// Reset cursor poller ke tanggal tertentu
// Input : {
//     "eventType": "REGISTER",
//     "date": "2023-10-25"
// }
router.post("/cursor/reset", async (req: Request, res: Response) => {
  const { eventType, date } = req.body;

  if (!eventType || !["REGISTER", "CHECKIN"].includes(eventType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid eventType. Must be 'REGISTER' or 'CHECKIN'.",
    });
  }

  const newDate = new Date(date);
  if (isNaN(newDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format. Use YYYY-MM-DD.",
    });
  }

  try {
    // Set time to start of day
    newDate.setHours(0, 0, 0, 0);

    await updateDateCursor({
      eventType,
      newDate,
    });

    console.log(
      `[ADMIN] Cursor for ${eventType} reset to ${newDate.toISOString()}`,
    );

    res.json({
      success: true,
      message: `Cursor for ${eventType} successfully reset to ${
        newDate.toISOString().split("T")[0]
      }. Poller will pick this up shortly.`,
    });
  } catch (error) {
    console.error(`Failed to reset cursor for ${eventType}:`, error);
    return res.status(500).json({
      success: false,
      message: "Failed to reset cursor",
      error: (error as Error).message,
    });
  }
});

export default router;
