/*
  Warnings:

  - You are about to drop the column `peserta` on the `RegistrationSnapshot` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `RegistrationSnapshot` DROP COLUMN `peserta`,
    ADD COLUMN `status_kunjungan` BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN `status_peserta` BOOLEAN NOT NULL DEFAULT false;
