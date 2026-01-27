-- CreateTable
CREATE TABLE `BpjsAntreanQueue` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `visit_id` VARCHAR(50) NOT NULL,
    `task_id` INTEGER NOT NULL,
    `event_time` DATETIME(3) NOT NULL,
    `payload` JSON NULL,
    `status` ENUM('PENDING', 'SEND', 'FAILED') NOT NULL DEFAULT 'PENDING',
    `retry_count` INTEGER NOT NULL DEFAULT 0,
    `last_error` VARCHAR(191) NULL,
    `sentAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `BpjsAntreanQueue_status_idx`(`status`),
    UNIQUE INDEX `BpjsAntreanQueue_visit_id_task_id_key`(`visit_id`, `task_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `BpjsAntreanLogs` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `queue_id` BIGINT NOT NULL,
    `request_payload` JSON NOT NULL,
    `response_payload` JSON NOT NULL,
    `http_code` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    INDEX `BpjsAntreanLogs_queue_id_idx`(`queue_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
