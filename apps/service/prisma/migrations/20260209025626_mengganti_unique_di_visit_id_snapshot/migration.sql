/*
  Warnings:

  - A unique constraint covering the columns `[visit_id]` on the table `RegistrationSnapshot` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `RegistrationSnapshot_visit_id_key` ON `RegistrationSnapshot`(`visit_id`);
