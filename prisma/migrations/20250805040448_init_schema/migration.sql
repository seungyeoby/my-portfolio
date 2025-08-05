-- CreateTable
CREATE TABLE `item_conditions` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `item_id` BIGINT NOT NULL,
    `condition_key` ENUM('NEW', 'USED', 'DAMAGED') NOT NULL,
    `condition_value` VARCHAR(191) NOT NULL,

    INDEX `item_conditions_item_id_fkey`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `items` (
    `item_id` BIGINT NOT NULL AUTO_INCREMENT,
    `category_id` BIGINT NOT NULL,
    `item_label` VARCHAR(191) NOT NULL,

    INDEX `items_category_id_fkey`(`category_id`),
    PRIMARY KEY (`item_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_category` (
    `category_id` BIGINT NOT NULL AUTO_INCREMENT,
    `category_label` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`category_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checklist_items` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `checklist_id` BIGINT NOT NULL,
    `item_id` BIGINT NOT NULL,
    `added_by_user` BOOLEAN NOT NULL,
    `removed_by_user` BOOLEAN NOT NULL,

    INDEX `checklist_items_checklist_id_fkey`(`checklist_id`),
    INDEX `checklist_items_item_id_fkey`(`item_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `checklists` (
    `checklist_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `travel_type` ENUM('BUSINESS', 'LEISURE', 'ADVENTURE') NOT NULL,
    `transportation` ENUM('CAR', 'PLANE', 'TRAIN', 'BUS') NOT NULL,
    `with_pet` BOOLEAN NOT NULL,
    `with_baby` BOOLEAN NOT NULL,
    `with_elderly` BOOLEAN NOT NULL,
    `visit_japan` BOOLEAN NOT NULL,
    `city_id` BIGINT NULL,
    `travel_start` DATE NOT NULL,
    `travel_end` DATE NOT NULL,
    `created_at` DATETIME(0) NOT NULL,
    `is_shared` BOOLEAN NOT NULL,
    `content` TEXT NOT NULL,
    `likes` BIGINT NOT NULL,

    INDEX `checklists_city_id_fkey`(`city_id`),
    INDEX `checklists_user_id_fkey`(`user_id`),
    PRIMARY KEY (`checklist_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `users` (
    `user_id` BIGINT NOT NULL AUTO_INCREMENT,
    `nickname` VARCHAR(191) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `password` VARCHAR(191) NOT NULL,
    `birth_date` DATE NOT NULL,
    `profile_photo` VARCHAR(191) NULL,
    `gender` ENUM('MALE', 'FEMALE', 'OTHER') NULL,
    `authority` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',

    UNIQUE INDEX `users_nickname_key`(`nickname`),
    UNIQUE INDEX `users_email_key`(`email`),
    PRIMARY KEY (`user_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `refresh_tokens` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `token` VARCHAR(191) NOT NULL,
    `expires_at` DATETIME(3) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `is_revoked` BOOLEAN NOT NULL DEFAULT false,

    UNIQUE INDEX `refresh_tokens_token_key`(`token`),
    INDEX `refresh_tokens_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `item_reviews` (
    `review_id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `image` VARCHAR(191) NULL,
    `likes` BIGINT NOT NULL,
    `created_at` DATE NOT NULL,
    `item_id` BIGINT NOT NULL,
    `deleted_at` DATE NULL,

    INDEX `item_reviews_item_id_fkey`(`item_id`),
    INDEX `item_reviews_user_id_fkey`(`user_id`),
    PRIMARY KEY (`review_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `travel_tips` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `category` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `cities` (
    `city_id` BIGINT NOT NULL AUTO_INCREMENT,
    `city_name` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`city_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `user_favorite_item_r` (
    `id` BIGINT NOT NULL AUTO_INCREMENT,
    `user_id` BIGINT NOT NULL,
    `review_id` BIGINT NOT NULL,
    `favorited_at` DATE NOT NULL,
    `deleted_at` DATE NULL,

    INDEX `user_favorite_item_r_review_id_fkey`(`review_id`),
    INDEX `user_favorite_item_r_user_id_fkey`(`user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `item_conditions` ADD CONSTRAINT `item_conditions_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `items` ADD CONSTRAINT `items_category_id_fkey` FOREIGN KEY (`category_id`) REFERENCES `item_category`(`category_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_items` ADD CONSTRAINT `checklist_items_checklist_id_fkey` FOREIGN KEY (`checklist_id`) REFERENCES `checklists`(`checklist_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklist_items` ADD CONSTRAINT `checklist_items_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_city_id_fkey` FOREIGN KEY (`city_id`) REFERENCES `cities`(`city_id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `checklists` ADD CONSTRAINT `checklists_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `refresh_tokens` ADD CONSTRAINT `refresh_tokens_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_reviews` ADD CONSTRAINT `item_reviews_item_id_fkey` FOREIGN KEY (`item_id`) REFERENCES `items`(`item_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `item_reviews` ADD CONSTRAINT `item_reviews_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_favorite_item_r` ADD CONSTRAINT `user_favorite_item_r_review_id_fkey` FOREIGN KEY (`review_id`) REFERENCES `item_reviews`(`review_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_favorite_item_r` ADD CONSTRAINT `user_favorite_item_r_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`user_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
