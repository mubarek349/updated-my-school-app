/*
  Warnings:

  - A unique constraint covering the columns `[chat_id]` on the table `admin` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `chat_id` to the `admin` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `admin` ADD COLUMN `chat_id` VARCHAR(191) NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX `admin_chat_id_key` ON `admin`(`chat_id`);
