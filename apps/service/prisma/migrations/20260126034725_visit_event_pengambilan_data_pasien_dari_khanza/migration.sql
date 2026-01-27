-- CreateTable
CREATE TABLE `VisitEvent` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `visit_id` VARCHAR(50) NOT NULL,
    `event_time` DATETIME(3) NOT NULL,
    `tanggal` DATETIME(3) NOT NULL,
    `jam_registrasi` VARCHAR(10) NOT NULL,
    `poli_id` VARCHAR(20) NOT NULL,
    `dokter_id` VARCHAR(20) NOT NULL,
    `no_rkm_medis` VARCHAR(50) NULL,
    `nomor_antrean` VARCHAR(20) NULL,
    `angka_antrean` INTEGER NULL,
    `payload` JSON NULL,
    `task_progress` JSON NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `VisitEvent_visit_id_key`(`visit_id`),
    INDEX `VisitEvent_event_time_idx`(`event_time`),
    INDEX `VisitEvent_tanggal_poli_id_dokter_id_idx`(`tanggal`, `poli_id`, `dokter_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
