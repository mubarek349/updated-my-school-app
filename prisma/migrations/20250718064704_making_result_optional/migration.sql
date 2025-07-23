/*
  Warnings:

  - Made the column `startingTime` on table `finalexamresult` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `finalexamresult` MODIFY `result` VARCHAR(191) NULL,
    MODIFY `startingTime` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
