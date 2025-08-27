/*
  Warnings:

  - You are about to alter the column `status` on the `tarbiaattendance` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `TinyInt`.

*/
-- AlterTable
ALTER TABLE `question` MODIFY `question` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `tarbiaattendance` MODIFY `status` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `wpos_wpdatatable_24` ADD COLUMN `chat_id` VARCHAR(191) NULL DEFAULT '';
