-- CreateTable
CREATE TABLE `VisitEventCursor` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `visit_id` VARCHAR(50) NOT NULL,
    `event_type` ENUM('REGISTER', 'CHECKIN', 'START', 'FINISH') NULL DEFAULT 'REGISTER',
    `event_time` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `VisitEventCursor_visit_id_key`(`visit_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
