/*
  Warnings:

  - Made the column `no_rkm_medis` on table `VisitEvent` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `VisitEvent` MODIFY `no_rkm_medis` VARCHAR(50) NOT NULL;
