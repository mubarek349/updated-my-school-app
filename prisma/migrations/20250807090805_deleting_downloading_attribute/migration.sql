/*
  Warnings:

  - You are about to drop the column `certificateUrl` on the `finalexamresult` table. All the data in the column will be lost.
  - You are about to drop the column `dateOfDownloadingCertificate` on the `finalexamresult` table. All the data in the column will be lost.
  - You are about to drop the column `result` on the `finalexamresult` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `finalexamresult` DROP COLUMN `certificateUrl`,
    DROP COLUMN `dateOfDownloadingCertificate`,
    DROP COLUMN `result`;
