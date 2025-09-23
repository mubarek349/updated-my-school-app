-- AlterTable
ALTER TABLE `question` ADD COLUMN `packageId` VARCHAR(191) NULL,
    MODIFY `chapterId` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `finalExamResult` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` INTEGER NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `result` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `question` ADD CONSTRAINT `question_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `coursePackage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finalExamResult` ADD CONSTRAINT `finalExamResult_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `wpos_wpdatatable_23`(`wdt_ID`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `finalExamResult` ADD CONSTRAINT `finalExamResult_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `coursePackage`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
