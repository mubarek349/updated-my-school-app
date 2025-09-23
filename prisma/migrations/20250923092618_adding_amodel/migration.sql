-- AlterTable
ALTER TABLE `chapter` ADD COLUMN `customVideo` TEXT NULL;

-- AlterTable
ALTER TABLE `coursepackage` ADD COLUMN `courseMaterials` TEXT NULL;

-- CreateTable
CREATE TABLE `qandAQuestion` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` INTEGER NOT NULL,
    `coursepackageId` VARCHAR(191) NOT NULL,
    `question` TEXT NOT NULL,
    `timestamp` INTEGER NULL,
    `type` VARCHAR(191) NOT NULL DEFAULT 'course',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `qandAQuestion_coursepackageId_idx`(`coursepackageId`),
    INDEX `qandAQuestion_studentId_idx`(`studentId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `qandAResponse` (
    `id` VARCHAR(191) NOT NULL,
    `videoQuestionId` VARCHAR(191) NOT NULL,
    `ustazId` INTEGER NOT NULL,
    `response` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,
    `adminId` VARCHAR(191) NULL,

    INDEX `qandAResponse_videoQuestionId_idx`(`videoQuestionId`),
    INDEX `qandAResponse_ustazId_idx`(`ustazId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `announcement` (
    `id` VARCHAR(191) NOT NULL,
    `anouncementDescription` TEXT NOT NULL,
    `attachLink` TEXT NULL,
    `coursesPackageId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `feedback` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` INTEGER NOT NULL,
    `coursePackageId` VARCHAR(191) NOT NULL,
    `feedback` TEXT NOT NULL,
    `rating` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `responseUstaz` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `phoneno` VARCHAR(191) NOT NULL,
    `passcode` VARCHAR(191) NOT NULL,
    `ustazname` VARCHAR(255) NULL,
    `chat_id` VARCHAR(191) NULL DEFAULT '',

    UNIQUE INDEX `responseUstaz_phoneno_key`(`phoneno`),
    UNIQUE INDEX `responseUstaz_passcode_key`(`passcode`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `qandAQuestion` ADD CONSTRAINT `qandAQuestion_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `wpos_wpdatatable_23`(`wdt_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qandAQuestion` ADD CONSTRAINT `qandAQuestion_coursepackageId_fkey` FOREIGN KEY (`coursepackageId`) REFERENCES `coursePackage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qandAResponse` ADD CONSTRAINT `qandAResponse_videoQuestionId_fkey` FOREIGN KEY (`videoQuestionId`) REFERENCES `qandAQuestion`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qandAResponse` ADD CONSTRAINT `qandAResponse_ustazId_fkey` FOREIGN KEY (`ustazId`) REFERENCES `responseUstaz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `qandAResponse` ADD CONSTRAINT `qandAResponse_adminId_fkey` FOREIGN KEY (`adminId`) REFERENCES `admin`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `announcement` ADD CONSTRAINT `announcement_coursesPackageId_fkey` FOREIGN KEY (`coursesPackageId`) REFERENCES `coursePackage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `wpos_wpdatatable_23`(`wdt_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `feedback` ADD CONSTRAINT `feedback_coursePackageId_fkey` FOREIGN KEY (`coursePackageId`) REFERENCES `coursePackage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
