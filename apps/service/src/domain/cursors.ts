import prisma from "../lib/prisma";
import { $Enums } from "@prisma/client";
import { cursorType } from "../types/registration";

export async function dateCursor({
  eventType,
}: {
  eventType: $Enums.VisitEventType;
}): Promise<{
  date: Date;
}> {
  // enum dari prisma

  // set tanggal
  const dateEnv =
    process.env.CURSOR_REGISTER || new Date().toISOString().split("T")[0];

  try {
    // Ambil cursor dari database
    const cursor = await prisma.visitEventCursor.findFirst({
      where: { event_type: eventType },
    });

    if (cursor) {
      return {
        date: cursor.event_time,
      };
    } else {
      await prisma.visitEventCursor.create({
        data: {
          event_type: eventType,
          event_time: new Date(dateEnv),
        },
      });
    }

    return {
      date: new Date(dateEnv),
    };
  } catch (error) {
    console.error("Error starting cursors:", error);
    throw error;
  }
}

export async function updateDateCursor({
  eventType,
  newDate,
}: {
  eventType: cursorType;
  newDate: Date;
}) {
  try {
    const cursor = await prisma.visitEventCursor.findFirst({
      where: { event_type: eventType },
    });

    if (cursor) {
      await prisma.visitEventCursor.update({
        where: { id: cursor.id },
        data: {
          event_time: newDate,
        },
      });
    }
  } catch (error) {
    console.error("Error updating cursor:", error);
    throw error;
  }
}
