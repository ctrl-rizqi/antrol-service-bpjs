/*
  Warnings:

  - Added the required column `event_time_datetime` to the `RegistrationSnapshot` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kodepoli` to the `RegistrationSnapshot` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `RegistrationSnapshot` ADD COLUMN `event_time_datetime` DATETIME(3) NOT NULL,
    ADD COLUMN `kodepoli` VARCHAR(20) NOT NULL,
    MODIFY `event_time` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE INDEX `RegistrationSnapshot_event_time_datetime_idx` ON `RegistrationSnapshot`(`event_time_datetime`);

-- CreateIndex
CREATE INDEX `RegistrationSnapshot_tanggal_idx` ON `RegistrationSnapshot`(`tanggal`);
