/*
  Warnings:

  - Added the required column `visit_id` to the `EventTask` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `EventTask` ADD COLUMN `visit_id` VARCHAR(50) NOT NULL;
