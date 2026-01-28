-- DropForeignKey
ALTER TABLE `EventTask` DROP FOREIGN KEY `EventTask_visit_event_id_fkey`;

-- AddForeignKey
ALTER TABLE `EventTask` ADD CONSTRAINT `EventTask_visit_event_id_fkey` FOREIGN KEY (`visit_event_id`) REFERENCES `VisitEvent`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
