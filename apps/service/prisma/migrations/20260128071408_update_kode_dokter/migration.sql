/*
  Warnings:

  - You are about to alter the column `dokter_id` on the `VisitEvent` table. The data in that column could be lost. The data in that column will be cast from `VarChar(20)` to `Int`.

*/
-- AlterTable
ALTER TABLE `VisitEvent` MODIFY `dokter_id` INTEGER NOT NULL;
