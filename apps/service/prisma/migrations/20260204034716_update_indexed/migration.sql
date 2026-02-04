-- DropIndex
DROP INDEX `EventTask_status_idx` ON `EventTask`;

-- CreateIndex
CREATE INDEX `EventTask_status_task_id_visit_id_idx` ON `EventTask`(`status`, `task_id`, `visit_id`);

-- CreateIndex
CREATE INDEX `VisitEventLog_visit_id_task_id_idx` ON `VisitEventLog`(`visit_id`, `task_id`);

-- CreateIndex
CREATE INDEX `VisitEventLog_sentAt_idx` ON `VisitEventLog`(`sentAt`);
