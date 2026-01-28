/*
  Warnings:

  - You are about to alter the column `task_id` on the `EventTask` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Int`.
  - You are about to alter the column `status` on the `EventTask` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `EventTask` MODIFY `task_id` INTEGER NOT NULL DEFAULT 0,
    MODIFY `status` ENUM('DONE', 'FAILED', 'PENDING') NOT NULL DEFAULT 'PENDING';
