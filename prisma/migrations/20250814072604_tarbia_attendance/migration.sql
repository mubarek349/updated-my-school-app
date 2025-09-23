-- CreateTable
CREATE TABLE `tarbiaAttendance` (
    `id` VARCHAR(191) NOT NULL,
    `studId` INTEGER NOT NULL,
    `packageId` VARCHAR(191) NOT NULL,
    `status` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `tarbiaAttendance` ADD CONSTRAINT `tarbiaAttendance_studId_fkey` FOREIGN KEY (`studId`) REFERENCES `wpos_wpdatatable_23`(`wdt_ID`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `tarbiaAttendance` ADD CONSTRAINT `tarbiaAttendance_packageId_fkey` FOREIGN KEY (`packageId`) REFERENCES `coursePackage`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
