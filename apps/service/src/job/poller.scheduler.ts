import { pollRegisterEvent } from "../poller/registration";

export function startPollerScheduler() {
  // Jalankan sebagai background worker (looping internal)
  // Jangan gunakan cron karena pollRegisterEvent sudah memiliki while(true)
  pollRegisterEvent();
  console.log("Poller scheduler worker started.");
}
