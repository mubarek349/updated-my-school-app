-- CreateTable
CREATE TABLE `coursePackage` (
    `id` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `description` VARCHAR(191) NULL,
    `userType` ENUM('KIDS', 'GENERAL', 'ADULT') NOT NULL DEFAULT 'GENERAL',
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `course` (
    `id` VARCHAR(191) NOT NULL,
    `title` TEXT NOT NULL,
    `description` TEXT NULL,
    `imageUrl` TEXT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `order` INTEGER NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `timeLimit` INTEGER NULL,
    `timeUnit` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `course_packageId_idx`(`packageId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `chapter` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `description` TEXT NULL,
    `videoUrl` TEXT NULL,
    `position` INTEGER NOT NULL,
    `isPublished` BOOLEAN NOT NULL DEFAULT false,
    `courseId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `chapter_courseId_idx`(`courseId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question` (
    `id` VARCHAR(191) NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `question` VARCHAR(191) NOT NULL,

    INDEX `question_chapterId_idx`(`chapterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questionOption` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `option` VARCHAR(191) NOT NULL,

    INDEX `questionOption_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questionAnswer` (
    `id` VARCHAR(191) NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `answerId` VARCHAR(191) NOT NULL,

    INDEX `questionAnswer_answerId_idx`(`answerId`),
    INDEX `questionAnswer_questionId_idx`(`questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `studentQuiz` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` INTEGER NOT NULL,
    `questionId` VARCHAR(191) NOT NULL,
    `takenAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `studentQuiz_questionId_idx`(`questionId`),
    INDEX `studentQuiz_studentId_idx`(`studentId`),
    UNIQUE INDEX `studentQuiz_studentId_questionId_key`(`studentId`, `questionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `studentQuizAnswer` (
    `id` VARCHAR(191) NOT NULL,
    `studentQuizId` VARCHAR(191) NOT NULL,
    `selectedOptionId` VARCHAR(191) NOT NULL,

    INDEX `studentQuizAnswer_selectedOptionId_idx`(`selectedOptionId`),
    INDEX `studentQuizAnswer_studentQuizId_idx`(`studentQuizId`),
    UNIQUE INDEX `studentQuizAnswer_studentQuizId_selectedOptionId_key`(`studentQuizId`, `selectedOptionId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `studentProgress` (
    `id` VARCHAR(191) NOT NULL,
    `studentId` INTEGER NOT NULL,
    `chapterId` VARCHAR(191) NOT NULL,
    `isStarted` BOOLEAN NOT NULL DEFAULT true,
    `isCompleted` BOOLEAN NOT NULL DEFAULT false,
    `completedAt` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    INDEX `studentProgress_chapterId_idx`(`chapterId`),
    INDEX `studentProgress_studentId_idx`(`studentId`),
    UNIQUE INDEX `studentProgress_studentId_chapterId_key`(`studentId`, `chapterId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `admin` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `phoneno` VARCHAR(191) NOT NULL,
    `passcode` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `admin_phoneno_key`(`phoneno`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `wpos_wpdatatable_23` (
    `wdt_ID` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `passcode` VARCHAR(191) NOT NULL,
    `phoneno` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `subject` VARCHAR(191) NULL,
    `chat_id` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `wpos_wpdatatable_23_passcode_key`(`passcode`),
    UNIQUE INDEX `wpos_wpdatatable_23_phoneno_key`(`phoneno`),
    UNIQUE INDEX `wpos_wpdatatable_23_chat_id_key`(`chat_id`),
    PRIMARY KEY (`wdt_ID`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `_PackageHistory` (
    `A` VARCHAR(191) NOT NULL,
    `B` INTEGER NOT NULL,

    UNIQUE INDEX `_PackageHistory_AB_unique`(`A`, `B`),
    INDEX `_PackageHistory_B_index`(`B`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `course` ADD CONSTRAINT `course_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `coursePackage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `chapter` ADD CONSTRAINT `chapter_courseId_fkey` FOREIGN KEY (`courseId`) REFERENCES `course`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question` ADD CONSTRAINT `question_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionOption` ADD CONSTRAINT `questionOption_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionAnswer` ADD CONSTRAINT `questionAnswer_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionAnswer` ADD CONSTRAINT `questionAnswer_answerId_fkey` FOREIGN KEY (`answerId`) REFERENCES `questionOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentQuiz` ADD CONSTRAINT `studentQuiz_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `wpos_wpdatatable_23`(`wdt_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentQuiz` ADD CONSTRAINT `studentQuiz_questionId_fkey` FOREIGN KEY (`questionId`) REFERENCES `question`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentQuizAnswer` ADD CONSTRAINT `studentQuizAnswer_studentQuizId_fkey` FOREIGN KEY (`studentQuizId`) REFERENCES `studentQuiz`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentQuizAnswer` ADD CONSTRAINT `studentQuizAnswer_selectedOptionId_fkey` FOREIGN KEY (`selectedOptionId`) REFERENCES `questionOption`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentProgress` ADD CONSTRAINT `studentProgress_studentId_fkey` FOREIGN KEY (`studentId`) REFERENCES `wpos_wpdatatable_23`(`wdt_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `studentProgress` ADD CONSTRAINT `studentProgress_chapterId_fkey` FOREIGN KEY (`chapterId`) REFERENCES `chapter`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `wpos_wpdatatable_23` ADD CONSTRAINT `wpos_wpdatatable_23_subject_fkey` FOREIGN KEY (`subject`) REFERENCES `coursePackage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PackageHistory` ADD CONSTRAINT `_PackageHistory_A_fkey` FOREIGN KEY (`A`) REFERENCES `coursePackage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `_PackageHistory` ADD CONSTRAINT `_PackageHistory_B_fkey` FOREIGN KEY (`B`) REFERENCES `wpos_wpdatatable_23`(`wdt_ID`) ON DELETE CASCADE ON UPDATE CASCADE;
