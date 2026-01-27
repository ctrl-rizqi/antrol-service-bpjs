/*
  Warnings:

  - You are about to drop the column `visit_id` on the `VisitEventCursor` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `VisitEventCursor_visit_id_key` ON `VisitEventCursor`;

-- AlterTable
ALTER TABLE `VisitEventCursor` DROP COLUMN `visit_id`;
