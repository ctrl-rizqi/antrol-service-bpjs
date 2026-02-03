import { pollRegisterEvent } from "../poller/registration";
import { pollQueueRegistration, pollQueueTask } from "../poller/queue";

export function startPollerScheduler() {
  // Jalankan sebagai background worker (looping internal)
  // Jangan gunakan cron karena pollRegisterEvent sudah memiliki while(true)
  pollRegisterEvent();
  pollQueueRegistration();
  pollQueueTask();
  console.log("Poller scheduler worker started.");
}
