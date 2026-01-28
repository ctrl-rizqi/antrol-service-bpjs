// Admin controller berisikan logika untuk mengelola data admin
import { Router } from "express";
import type { Request, Response } from "express";
import prisma from "../lib/prisma";
import { paginate } from "../utils/pagination";
import { fetchRegistrationByNoReg } from "../khanza/khanza.query";
import { checkTaskId, processRegistrationRow } from "../poller/registration";

const router: Router = Router();

// Mengambil semua VisitEvent dan beserta statusnya
router.get("/visit-event", async (req: Request, res: Response) => {
  try {
    const paginatedVisitEvents = await paginate(prisma.visitEvent, req, {
      include: {
        EventTasks: true,
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

router.post(
  "/visit-event/:id/revalidate",
  async (req: Request, res: Response) => {
    const { id: noReg } = req.params;

    if (typeof noReg !== "string") {
      return res.status(400).json({
        success: false,
        message: "Invalid registration number format.",
      });
    }

    try {
      // 1. Fetch fresh data from Khanza using no_reg
      const khanzaRow = await fetchRegistrationByNoReg(noReg);
      if (!khanzaRow) {
        return res.status(404).json({
          success: false,
          message: `Registration with no_reg ${noReg} not found in Khanza.`,
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
        `Failed to revalidate visit_id for no_reg ${noReg}:`,
        error,
      );
      return res.status(500).json({
        success: false,
        message: `Failed to revalidate visit_id for no_reg ${noReg}`,
        error: (error as Error).message,
      });
    }
  },
);

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

export default router;
