/**
 * Generate waktu task dengan delay yang natural berdasarkan no_reg
 * @param {string} noReg - Nomor registrasi pasien
 * @param {Date|string} baseDateTime - Waktu dasar (bisa Date object atau string)
 * @param {number} minDelay - Delay minimum dalam menit
 * @param {number} maxDelay - Delay maksimum dalam menit
 * @returns {Date} Waktu task yang sudah ditambah delay
 */
export function generateTaskTime(
  noReg: string,
  baseDateTime: Date | string,
  minDelay: number,
  maxDelay: number,
) {
  // Konversi ke Date object jika masih string
  const baseDate =
    baseDateTime instanceof Date
      ? new Date(baseDateTime)
      : new Date(baseDateTime);

  // Hash sederhana dari no_reg
  let hash = 0;
  for (let i = 0; i < noReg.length; i++) {
    hash = (hash << 5) - hash + noReg.charCodeAt(i);
    hash = hash & hash; // Convert to 32bit integer
  }

  // Hitung range delay
  const delayRange = maxDelay - minDelay;
  const delayMinutes = minDelay + (Math.abs(hash) % (delayRange + 1));

  // Variasi detik dari waktu base
  const baseMinutes = baseDate.getMinutes();
  const baseSeconds = baseDate.getSeconds();
  const secondsVariation = (baseMinutes * 17 + baseSeconds * 7) % 60;

  // Buat waktu baru dengan delay
  const taskTime = new Date(baseDate);
  taskTime.setMinutes(taskTime.getMinutes() + delayMinutes);
  taskTime.setSeconds(taskTime.getSeconds() + secondsVariation);

  return taskTime;
}
