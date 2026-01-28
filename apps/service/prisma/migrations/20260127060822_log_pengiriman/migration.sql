/*
  Warnings:

  - You are about to drop the `BpjsAntreanLogs` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BpjsAntreanQueue` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE `BpjsAntreanLogs`;

-- DropTable
DROP TABLE `BpjsAntreanQueue`;

-- CreateTable
CREATE TABLE `VisitEventLog` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `visit_id` VARCHAR(50) NOT NULL,
    `task_id` VARCHAR(10) NOT NULL,
    `event_time` DATETIME(3) NOT NULL,
    `payload` JSON NOT NULL,
    `http_code` INTEGER NOT NULL,
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `last_error` VARCHAR(191) NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
