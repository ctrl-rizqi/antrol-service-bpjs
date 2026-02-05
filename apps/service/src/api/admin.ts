// Admin controller berisikan logika untuk mengelola data admin
import { Router } from "express";
import type { Request, Response } from "express";
import prisma, { Prisma } from "../lib/prisma";
import { paginate } from "../utils/pagination";
import { fetchRegistrationByNoReg } from "../khanza/khanza.query";
import { checkTaskId, processRegistrationRow } from "../poller/registration";
import { processRegistrationTask, processUpdateTask } from "../poller/queue";
import { updateDateCursor } from "../domain/cursors";
import { getListTaskByKodebooking } from "../bpjs/bpjs.client";
import { listTasksArraySchema } from "../validator/listtask-validator";
import { noContentResponseSchema } from "../utils/NoContentResponse";
import { parseWibDateString, toFaceValueUTC } from "../utils/formatDate";

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
      {
        flags: {
          some: {
            category: {
              name: { contains: search },
            },
          },
        },
      },
    ];
  }

  if (startDate || endDate) {
    where.tanggal = {};
    if (startDate) {
      where.tanggal.gte = new Date(`${startDate}T00:00:00.000Z`);
    }
    if (endDate) {
      const end = new Date(`${endDate}T00:00:00.000Z`);
      if (endDate.length === 10) end.setUTCHours(23, 59, 59, 999);
      where.tanggal.lte = end;
    }
  }

  try {
    const paginatedVisitEvents = await paginate(prisma.visitEvent, req, {
      where,
      include: {
        EventTasks: true,
        flags: {
          include: {
            category: true,
          },
        },
      },
      orderBy: {
        tanggal: "desc",
      },
    });

    res.json({
      success: true,
      data: paginatedVisitEvents.data,
      meta: paginatedVisitEvents.meta,
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
      include: { EventTasks: { orderBy: { task_id: "asc" } } },
    });

    if (!visitEvent) {
      return res.status(404).json({
        success: false,
        message: `VisitEvent with id ${id} not found.`,
      });
    }

    // Fetch related logs in a separate query
    const visitLogs = await prisma.visitEventLog.findMany({
      where: { visit_id: visitEvent.visit_id },
      orderBy: { createdAt: "asc" },
    });

    // Manually attach logs to each task
    // Note: EventTask.task_id is Int, VisitEventLog.task_id is String
    const tasksWithLogs = visitEvent.EventTasks.map((task) => {
      const logs = visitLogs.filter(
        (log) => log.task_id === String(task.task_id),
      );
      // Create a new object to avoid modifying the original task object from prisma result
      return { ...task, logs };
    });

    // Replace the original tasks with the augmented ones
    const responseData = { ...visitEvent, EventTasks: tasksWithLogs };

    res.json({
      success: true,
      data: responseData,
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

  const newDate = new Date(`${date}T00:00:00.000Z`);
  if (isNaN(newDate.getTime())) {
    return res.status(400).json({
      success: false,
      message: "Invalid date format. Use YYYY-MM-DD.",
    });
  }

  try {
    // Set time to start of day
    // newDate.setHours(0, 0, 0, 0); // This was a bug (used local timezone) and is now redundant.

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

// Mengambil getlisttask dari API
router.post("/visit-event/sync", async (req: Request, res: Response) => {
  const { kodebooking } = req.body || {};

  if (typeof kodebooking !== "string") {
    return res.status(400).json({
      success: false,
      message: "Invalid registration number format.",
    });
  }

  try {
    const response = await getListTaskByKodebooking(kodebooking);
    // jika ada maka akan memberikan array jika tidak akan memberikan object
    // { metadata: { code: 204, message: 'No Content } }
    // console.log(response);
    const noContentCheck = noContentResponseSchema.safeParse(response);

    if (noContentCheck.success) {
      return res.json({
        success: true,
        message: "No visit events found.",
        data: [],
      });
    }

    // Output:
    // [
    //   {
    //     wakturs: "30-01-2026 15:30:00 WIB",
    //     waktu: "30-01-2026 15:33:12 WIB",
    //     taskname: "akhir waktu layan admisi/mulai waktu tunggu poli",
    //     taskid: 3,
    //     kodebooking: "2026/01/30/005696",
    //   },
    //   {
    //     wakturs: "30-01-2026 15:46:57 WIB",
    //     waktu: "30-01-2026 15:47:59 WIB",
    //     taskname: "akhir waktu tunggu poli/mulai waktu layan poli",
    //     taskid: 4,
    //     kodebooking: "2026/01/30/005696",
    //   },
    //   {
    //     wakturs: "30-01-2026 16:02:41 WIB",
    //     waktu: "30-01-2026 16:03:24 WIB",
    //     taskname: "akhir waktu layan poli",
    //     taskid: 5,
    //     kodebooking: "2026/01/30/005696",
    //   },
    //   {
    //     wakturs: "30-01-2026 16:05:39 WIB",
    //     waktu: "30-01-2026 16:07:53 WIB",
    //     taskname: "mulai waktu layan farmasi",
    //     taskid: 6,
    //     kodebooking: "2026/01/30/005696",
    //   },
    //   {
    //     wakturs: "30-01-2026 16:39:58 WIB",
    //     waktu: "30-01-2026 16:42:54 WIB",
    //     taskname: "akhir waktu layan farmasi",
    //     taskid: 7,
    //     kodebooking: "2026/01/30/005696",
    //   },
    // ];
    const validated = listTasksArraySchema.parse(response);

    // waktu sync
    const syncTime = toFaceValueUTC(new Date());
    // Menyimpan ke database
    // transaksi, menyimpan task id berdasarkan kodebooking
    await prisma.$transaction(async (tx) => {
      const visitEvent = await tx.visitEvent.update({
        where: { visit_id: kodebooking },
        data: {
          syncedAt: syncTime,
        },
      });

      // delete event task, kecuali task_id 0
      await tx.eventTask.deleteMany({
        where: {
          visit_event_id: visitEvent.id,
          task_id: {
            not: 0,
          },
        },
      });

      // menyimpan waktu
      for (const task of validated) {
        await tx.eventTask.create({
          data: {
            visit_id: task.kodebooking,
            task_id: task.taskid,
            status: "SEND",
            event_time: parseWibDateString(task.wakturs),
            visit_event_id: visitEvent.id,
          },
        });
      }
    });

    res.json({
      success: true,
      message: "Visit events synced successfully.",
      data: validated,
    });
  } catch (error) {
    console.error("Failed to sync visit events:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to sync visit events",
      error: (error as Error).message,
    });
  }
});

// Menambahkan flag/kategori pada visitEvent
// Input: { kodebooking: }
router.post("/visit-event/category", async (req: Request, res: Response) => {
  const { kodebooking, category } = req.body || {};

  if (!kodebooking || !category) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields.",
    });
  }

  try {
    const visitEvent = await prisma.flag.upsert({
      where: { id: kodebooking },
      update: {
        category: {
          connectOrCreate: {
            where: { name: category },
            create: { name: category },
          },
        },
      },
      create: {
        visit_id: kodebooking,
        category_id: category,
      },
      include: { category: true },
    });

    res.json({
      success: true,
      message: "Visit event category updated successfully.",
      data: visitEvent,
    });
  } catch (error) {
    console.error("Failed to update visit event category:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to update visit event category",
      error: (error as Error).message,
    });
  }
});

export default router;
