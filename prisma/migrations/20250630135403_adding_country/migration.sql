-- AlterTable
ALTER TABLE `subjectpackage` ADD COLUMN `kidpackage` BOOLEAN NULL DEFAULT false,
    MODIFY `packageType` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `wpos_wpdatatable_23` ADD COLUMN `country` VARCHAR(191) NULL;
