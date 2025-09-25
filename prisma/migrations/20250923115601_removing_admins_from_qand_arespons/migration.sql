/*
  Warnings:

  - You are about to drop the column `adminId` on the `qandaresponse` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE `qandaresponse` DROP FOREIGN KEY `qandAResponse_adminId_fkey`;

-- DropIndex
DROP INDEX `qandAResponse_adminId_fkey` ON `qandaresponse`;

-- AlterTable
ALTER TABLE `qandaresponse` DROP COLUMN `adminId`;
