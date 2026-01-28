/*
  Warnings:

  - You are about to alter the column `status` on the `EventTask` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `EventTask` MODIFY `status` ENUM('DONE', 'FAILED', 'SEND') NOT NULL DEFAULT 'FAILED';
