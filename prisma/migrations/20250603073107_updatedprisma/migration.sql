/*
  Warnings:

  - You are about to drop the column `userType` on the `coursepackage` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `wpos_wpdatatable_23_chat_id_key` ON `wpos_wpdatatable_23`;

-- AlterTable
ALTER TABLE `coursepackage` DROP COLUMN `userType`,
    ADD COLUMN `assignedSubjects` TEXT NULL;

-- AlterTable
ALTER TABLE `wpos_wpdatatable_23` MODIFY `name` VARCHAR(191) NULL,
    MODIFY `passcode` VARCHAR(191) NULL,
    MODIFY `phoneno` VARCHAR(191) NULL,
    MODIFY `status` VARCHAR(191) NULL,
    MODIFY `subject` VARCHAR(191) NULL,
    MODIFY `chat_id` VARCHAR(191) NULL DEFAULT '';
