-- AlterTable
ALTER TABLE `wpos_wpdatatable_23` ADD COLUMN `u_control` VARCHAR(255) NULL,
    ADD COLUMN `ustaz` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `wpos_wpdatatable_24` (
    `wdt_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `picture` VARCHAR(2000) NULL,
    `control` VARCHAR(255) NULL,
    `subject` VARCHAR(255) NULL,
    `phone` VARCHAR(255) NULL,
    `schedule` VARCHAR(255) NULL,
    `password` VARCHAR(255) NULL,
    `telegramgroup` VARCHAR(2000) NULL,
    `ustazname` VARCHAR(255) NULL,
    `gender` VARCHAR(255) NULL,
    `ustazid` VARCHAR(255) NULL,
    `userid` INTEGER NULL,
    `username` VARCHAR(255) NULL,

    UNIQUE INDEX `wpos_wpdatatable_24_ustazid_key`(`ustazid`),
    PRIMARY KEY (`wdt_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wpos_wpdatatable_28` (
    `wdt_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `bot` VARCHAR(255) NULL,
    `chatid` VARCHAR(255) NULL,
    `name` VARCHAR(255) NULL,
    `code` VARCHAR(255) NULL,
    `topic` VARCHAR(255) NULL,
    `team_id` INTEGER UNSIGNED NULL,
    `Phone` VARCHAR(50) NULL,
    `username` VARCHAR(60) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `is_leader` BOOLEAN NULL DEFAULT false,

    UNIQUE INDEX `wpos_wpdatatable_28_code_key`(`code`),
    PRIMARY KEY (`wdt_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `wpos_wpdatatable_23` ADD CONSTRAINT `wpos_wpdatatable_23_ustaz_fkey` FOREIGN KEY (`ustaz`) REFERENCES `wpos_wpdatatable_24`(`ustazid`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wpos_wpdatatable_23` ADD CONSTRAINT `wpos_wpdatatable_23_u_control_fkey` FOREIGN KEY (`u_control`) REFERENCES `wpos_wpdatatable_28`(`code`) ON DELETE SET NULL ON UPDATE CASCADE;
