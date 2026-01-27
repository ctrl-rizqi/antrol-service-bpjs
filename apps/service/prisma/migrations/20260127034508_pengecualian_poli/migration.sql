-- CreateTable
CREATE TABLE `PoliException` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `poli_id` VARCHAR(20) NOT NULL,
    `nama_poli` VARCHAR(100) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    UNIQUE INDEX `PoliException_poli_id_key`(`poli_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
