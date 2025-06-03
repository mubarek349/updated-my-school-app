/*
  Warnings:

  - A unique constraint covering the columns `[name]` on the table `coursePackage` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `wpos_wpdatatable_23` DROP FOREIGN KEY `wpos_wpdatatable_23_subject_fkey`;

-- DropIndex
DROP INDEX `wpos_wpdatatable_23_subject_fkey` ON `wpos_wpdatatable_23`;

-- AlterTable
ALTER TABLE `coursepackage` MODIFY `name` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `coursePackage_name_key` ON `coursePackage`(`name`);

-- AddForeignKey
ALTER TABLE `wpos_wpdatatable_23` ADD CONSTRAINT `wpos_wpdatatable_23_subject_fkey` FOREIGN KEY (`subject`) REFERENCES `coursePackage`(`name`) ON DELETE SET NULL ON UPDATE CASCADE;
