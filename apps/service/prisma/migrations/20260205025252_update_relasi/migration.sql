-- AlterTable
ALTER TABLE `Flag` MODIFY `category_id` BIGINT NOT NULL;

-- AddForeignKey
ALTER TABLE `Flag` ADD CONSTRAINT `Flag_visit_id_fkey` FOREIGN KEY (`visit_id`) REFERENCES `VisitEvent`(`visit_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Flag` ADD CONSTRAINT `Flag_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `Category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
