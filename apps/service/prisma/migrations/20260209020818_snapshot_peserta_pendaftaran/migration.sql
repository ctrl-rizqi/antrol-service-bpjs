-- CreateTable
CREATE TABLE `RegistrationSnapshot` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `visit_id` VARCHAR(50) NOT NULL,
    `event_time` DATETIME(3) NOT NULL,
    `no_rkm_medis` VARCHAR(50) NOT NULL,
    `sumber_data` VARCHAR(100) NOT NULL,
    `tanggal` DATE NOT NULL,
    `kodedokter` INTEGER NOT NULL,
    `peserta` BOOLEAN NOT NULL DEFAULT false,
    `payload` JSON NOT NULL,
    `fetchedAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `RegistrationSnapshot_visit_id_idx`(`visit_id`),
    INDEX `RegistrationSnapshot_event_time_idx`(`event_time`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
