import prisma, { Prisma } from "../lib/prisma";
import { $Enums } from "@prisma/client";

export async function dateCursor({
  eventType,
}: {
  eventType: $Enums.VisitEventType;
}): Promise<{
  date: Date;
}> {
  // set tanggal default
  const dateEnv =
    process.env.CURSOR_REGISTER || new Date().toISOString().split("T")[0];

  // event_type is unique, so we can use findUnique
  const cursor = await prisma.visitEventCursor.findUnique({
    where: { event_type: eventType },
  });

  if (cursor) {
    return { date: cursor.event_time };
  }

  // If cursor doesn't exist, try to create it.
  // This might fail if another process creates it at the same time (race condition).
  try {
    const newCursor = await prisma.visitEventCursor.create({
      data: {
        event_type: eventType,
        event_time: new Date(`${dateEnv}T00:00:00.000Z`),
      },
    });
    return { date: newCursor.event_time };
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2002") {
      // Unique constraint failed: the cursor was created by a concurrent process.
      // We can now safely re-fetch it.
      console.log(
        `[CURSOR] Race condition handled: ${eventType} cursor created by another process. Refetching.`,
      );
      const existingCursor = await prisma.visitEventCursor.findUnique({
        where: { event_type: eventType },
      });

      if (existingCursor) {
        return { date: existingCursor.event_time };
      }
    }
    // If it's a different error, or if re-fetching somehow fails, we throw.
    console.error(
      `[FATAL] Could not create or fetch cursor for ${eventType}:`,
      e,
    );
    throw new Error(`Could not initialize cursor for ${eventType}.`);
  }
}

export async function updateDateCursor({
  eventType,
  newDate,
}: {
  eventType: $Enums.VisitEventType;
  newDate: Date;
}) {
  try {
    // With the unique constraint on event_type, we can update directly
    // without fetching first. This is more efficient.
    await prisma.visitEventCursor.update({
      where: { event_type: eventType },
      data: {
        event_time: newDate,
      },
    });
  } catch (error) {
    // This might fail if the cursor somehow doesn't exist, but in the poller's flow,
    // dateCursor would have been called first, ensuring it does.
    console.error(
      `[CURSOR_UPDATE_ERROR] Failed to update cursor for ${eventType}:`,
      error,
    );
    throw error;
  }
}
