/*
  Warnings:

  - You are about to drop the column `task_progress` on the `VisitEvent` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `VisitEvent` DROP COLUMN `task_progress`;

-- CreateTable
CREATE TABLE `EventTask` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `visit_id` VARCHAR(50) NOT NULL,
    `task_id` VARCHAR(10) NOT NULL,
    `status` VARCHAR(10) NOT NULL,
    `event_time` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,
    `visitEventId` BIGINT NULL,

    UNIQUE INDEX `EventTask_visit_id_key`(`visit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `EventTask` ADD CONSTRAINT `EventTask_visitEventId_fkey` FOREIGN KEY (`visitEventId`) REFERENCES `VisitEvent`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
