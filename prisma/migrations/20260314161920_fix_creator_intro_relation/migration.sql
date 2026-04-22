/*
  Warnings:

  - You are about to drop the column `companyName` on the `Brief` table. All the data in the column will be lost.
  - You are about to drop the column `contactEmail` on the `Brief` table. All the data in the column will be lost.
  - You are about to drop the column `contactName` on the `Brief` table. All the data in the column will be lost.
  - You are about to drop the column `contactPhone` on the `Brief` table. All the data in the column will be lost.
  - You are about to drop the `BriefAsset` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('NEW_BRIEF', 'CREATOR_UPLOAD', 'STAFF_CHANGES_REQUESTED', 'BRAND_CHANGES_REQUESTED', 'BRAND_APPROVED');

-- DropForeignKey
ALTER TABLE "BriefAsset" DROP CONSTRAINT "BriefAsset_assetId_fkey";

-- DropForeignKey
ALTER TABLE "BriefAsset" DROP CONSTRAINT "BriefAsset_briefId_fkey";

-- DropIndex
DROP INDEX "Brief_assignedCreatorId_idx";

-- DropIndex
DROP INDEX "Brief_brandId_idx";

-- DropIndex
DROP INDEX "CreatorProfile_introVideoAssetId_idx";

-- DropIndex
DROP INDEX "Deliverable_briefId_idx";

-- DropIndex
DROP INDEX "Deliverable_creatorId_idx";

-- AlterTable
ALTER TABLE "Brief" DROP COLUMN "companyName",
DROP COLUMN "contactEmail",
DROP COLUMN "contactName",
DROP COLUMN "contactPhone";

-- AlterTable
ALTER TABLE "Deliverable" ADD COLUMN     "staffFeedback" TEXT;

-- DropTable
DROP TABLE "BriefAsset";

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "link" TEXT,
    "read" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_userId_idx" ON "Notification"("userId");

-- CreateIndex
CREATE INDEX "Notification_read_idx" ON "Notification"("read");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
