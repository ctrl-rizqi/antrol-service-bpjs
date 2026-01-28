/*
  Warnings:

  - You are about to drop the column `visitEventId` on the `EventTask` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[visit_event_id,task_id]` on the table `EventTask` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `visit_event_id` to the `EventTask` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `EventTask` DROP FOREIGN KEY `EventTask_visitEventId_fkey`;

-- DropIndex
DROP INDEX `EventTask_visitEventId_task_id_idx` ON `EventTask`;

-- DropIndex
DROP INDEX `EventTask_visitEventId_task_id_key` ON `EventTask`;

-- AlterTable
ALTER TABLE `EventTask` DROP COLUMN `visitEventId`,
    ADD COLUMN `visit_event_id` BIGINT NOT NULL;

-- CreateIndex
CREATE INDEX `EventTask_event_time_idx` ON `EventTask`(`event_time`);

-- CreateIndex
CREATE UNIQUE INDEX `EventTask_visit_event_id_task_id_key` ON `EventTask`(`visit_event_id`, `task_id`);

-- AddForeignKey
ALTER TABLE `EventTask` ADD CONSTRAINT `EventTask_visit_event_id_fkey` FOREIGN KEY (`visit_event_id`) REFERENCES `VisitEvent`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
