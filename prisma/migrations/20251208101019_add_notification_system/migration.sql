/*
  Warnings:

  - You are about to drop the column `link` on the `notification` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `notification` DROP COLUMN `link`,
    ADD COLUMN `target` VARCHAR(191) NOT NULL DEFAULT 'admin',
    ADD COLUMN `url` VARCHAR(191) NULL,
    ADD COLUMN `userId` INTEGER NULL;

-- CreateIndex
CREATE INDEX `notification_userId_idx` ON `notification`(`userId`);

-- CreateIndex
CREATE INDEX `notification_target_idx` ON `notification`(`target`);

-- CreateIndex
CREATE INDEX `notification_isRead_idx` ON `notification`(`isRead`);
