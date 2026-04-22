/*
  Warnings:

  - You are about to drop the `UserSettings` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserSettings" DROP CONSTRAINT "UserSettings_userId_fkey";

-- AlterTable
ALTER TABLE "Brief" ADD COLUMN     "deliverableCount" INTEGER NOT NULL DEFAULT 1;

-- DropTable
DROP TABLE "UserSettings";
