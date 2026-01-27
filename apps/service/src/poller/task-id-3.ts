import { dateCursor } from "../job/cursors";
import { fetchRegistrations } from "../khanza/khanza.query";
import prisma from "../lib/prisma";

export async function pollTaskId3() {
  try {
    // Initialize cursor sekali di awal
    let cursorDate = await dateCursor({
      eventType: "CHECKIN",
    });
  } catch (error) {}
}
