/*
  Warnings:

  - You are about to drop the column `visit_event_id` on the `Flag` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `Flag` DROP FOREIGN KEY `Flag_visit_event_id_fkey`;

-- DropIndex
DROP INDEX `Flag_visit_event_id_fkey` ON `Flag`;

-- AlterTable
ALTER TABLE `Flag` DROP COLUMN `visit_event_id`;

-- AddForeignKey
ALTER TABLE `Flag` ADD CONSTRAINT `Flag_visit_id_fkey` FOREIGN KEY (`visit_id`) REFERENCES `VisitEvent`(`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE;
