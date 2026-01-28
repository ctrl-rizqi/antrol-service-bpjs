import { pollQueueRegistration, pollQueueTask } from "../poller/queue";

export function startQueuePoller() {
  // Jalankan poller sebagai background worker (looping internal)
  // Tidak menggunakan cron agar tidak terjadi penumpukan process (memory leak) karena di dalamnya sudah ada while(true)
  pollQueueRegistration();
  // Jalankan worker untuk Task 3-7 (Waktu Tunggu) secara paralel
  pollQueueTask();
  console.log("Queue poller worker started.");
}
