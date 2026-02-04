/*
  Warnings:

  - A unique constraint covering the columns `[event_type]` on the table `VisitEventCursor` will be added. If there are existing duplicate values, this will fail.
  - Made the column `event_type` on table `VisitEventCursor` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `VisitEventCursor` MODIFY `event_type` ENUM('POLLER', 'REGISTER', 'CHECKIN', 'START', 'FINISH') NOT NULL DEFAULT 'REGISTER';

-- CreateIndex
CREATE UNIQUE INDEX `VisitEventCursor_event_type_key` ON `VisitEventCursor`(`event_type`);
