/*
  Warnings:

  - You are about to drop the column `visit_id` on the `EventTask` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[visitEventId,task_id]` on the table `EventTask` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `EventTask_visit_id_key` ON `EventTask`;

-- AlterTable
ALTER TABLE `EventTask` DROP COLUMN `visit_id`;

-- CreateIndex
CREATE INDEX `EventTask_status_idx` ON `EventTask`(`status`);

-- CreateIndex
CREATE INDEX `EventTask_visitEventId_task_id_idx` ON `EventTask`(`visitEventId`, `task_id`);

-- CreateIndex
CREATE UNIQUE INDEX `EventTask_visitEventId_task_id_key` ON `EventTask`(`visitEventId`, `task_id`);
