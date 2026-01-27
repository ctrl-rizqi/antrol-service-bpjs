-- CreateTable
CREATE TABLE `DoctorScheduleQuota` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `dokter_id` VARCHAR(20) NOT NULL,
    `poli_id` VARCHAR(20) NOT NULL,
    `nama_dokter` VARCHAR(100) NOT NULL,
    `nama_poli` VARCHAR(100) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `jam_mulai` VARCHAR(10) NOT NULL,
    `jam_selesai` VARCHAR(10) NOT NULL,
    `kuota_jkn` INTEGER NOT NULL,
    `source` VARCHAR(191) NOT NULL,
    `fetchedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `DoctorScheduleQuota_tanggal_poli_id_dokter_id_idx`(`tanggal`, `poli_id`, `dokter_id`),
    UNIQUE INDEX `DoctorScheduleQuota_poli_id_dokter_id_tanggal_jam_mulai_key`(`poli_id`, `dokter_id`, `tanggal`, `jam_mulai`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
