/*
  Warnings:

  - Made the column `event_time` on table `VisitEventCursor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `VisitEventCursor` MODIFY `event_time` DATETIME(3) NOT NULL;
