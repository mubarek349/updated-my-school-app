-- AlterTable
ALTER TABLE `coursepackage` ADD COLUMN `ustazId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `coursePackage` ADD CONSTRAINT `coursePackage_ustazId_fkey` FOREIGN KEY (`ustazId`) REFERENCES `wpos_wpdatatable_24`(`wdt_ID`) ON DELETE SET NULL ON UPDATE CASCADE;
