import cron from "node-cron";
import { pollRegisterEvent } from "../poller/registration";

export function startPollerScheduler() {
  // Schedule the polling job to run every 1 minutes
  cron.schedule("*/1 * * * *", pollRegisterEvent);

  console.log("Poller scheduler started, polling every 1 minutes.");
}
