-- DropForeignKey
ALTER TABLE `qandaresponse` DROP FOREIGN KEY `qandAResponse_ustazId_fkey`;

-- AddForeignKey
ALTER TABLE `qandAResponse` ADD CONSTRAINT `qandAResponse_ustazId_fkey` FOREIGN KEY (`ustazId`) REFERENCES `responseUstaz`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
