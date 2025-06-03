/*
  Warnings:

  - Made the column `subject` on table `wpos_wpdatatable_23` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `wpos_wpdatatable_23` DROP FOREIGN KEY `wpos_wpdatatable_23_subject_fkey`;

-- DropIndex
DROP INDEX `coursePackage_name_key` ON `coursepackage`;

-- DropIndex
DROP INDEX `wpos_wpdatatable_23_subject_fkey` ON `wpos_wpdatatable_23`;

-- AlterTable
ALTER TABLE `coursepackage` MODIFY `userId` TEXT NOT NULL,
    MODIFY `description` TEXT NULL,
    MODIFY `name` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `wpos_wpdatatable_23` ADD COLUMN `youtubeSubject` VARCHAR(191) NULL,
    MODIFY `subject` VARCHAR(191) NOT NULL;

-- AddForeignKey
ALTER TABLE `wpos_wpdatatable_23` ADD CONSTRAINT `wpos_wpdatatable_23_youtubeSubject_fkey` FOREIGN KEY (`youtubeSubject`) REFERENCES `coursePackage`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
