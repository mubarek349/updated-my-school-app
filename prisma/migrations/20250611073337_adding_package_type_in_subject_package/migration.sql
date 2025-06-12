/*
  Warnings:

  - Added the required column `packageType` to the `subjectPackage` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `subjectPackage_subject_key` ON `subjectpackage`;

-- AlterTable
ALTER TABLE `subjectpackage` ADD COLUMN `packageType` VARCHAR(191) NOT NULL,
    MODIFY `subject` VARCHAR(191) NULL;
