/*
  Warnings:

  - Added the required column `visit_event_id` to the `Flag` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Flag` DROP FOREIGN KEY `Flag_visit_id_fkey`;

-- AlterTable
ALTER TABLE `Flag` ADD COLUMN `visit_event_id` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `Flag` ADD CONSTRAINT `Flag_visit_event_id_fkey` FOREIGN KEY (`visit_event_id`) REFERENCES `VisitEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
