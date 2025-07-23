-- AlterTable
ALTER TABLE `coursepackage` ADD COLUMN `examDurationMinutes` INTEGER NULL;

-- AlterTable
ALTER TABLE `finalexamresult` ADD COLUMN `endingTime` DATETIME(3) NULL,
    ADD COLUMN `startingTime` DATETIME(3) NULL;

-- AlterTable
ALTER TABLE `studentquiz` ADD COLUMN `isFinalExam` BOOLEAN NOT NULL DEFAULT false;
