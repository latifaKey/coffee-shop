/*
  Warnings:

  - You are about to drop the column `attendanceNotes` on the `classregistration` table. All the data in the column will be lost.
  - You are about to drop the column `attendanceStatus` on the `classregistration` table. All the data in the column will be lost.
  - You are about to drop the column `classImage` on the `classregistration` table. All the data in the column will be lost.
  - You are about to drop the column `completedDate` on the `classregistration` table. All the data in the column will be lost.
  - You are about to drop the column `paymentNotes` on the `classregistration` table. All the data in the column will be lost.
  - You are about to drop the column `paymentStatus` on the `classregistration` table. All the data in the column will be lost.
  - You are about to drop the column `paymentVerifiedAt` on the `classregistration` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `classregistration` DROP COLUMN `attendanceNotes`,
    DROP COLUMN `attendanceStatus`,
    DROP COLUMN `classImage`,
    DROP COLUMN `completedDate`,
    DROP COLUMN `paymentNotes`,
    DROP COLUMN `paymentStatus`,
    DROP COLUMN `paymentVerifiedAt`;
