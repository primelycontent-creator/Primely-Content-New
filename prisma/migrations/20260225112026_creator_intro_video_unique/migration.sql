/*
  Warnings:

  - You are about to drop the column `displayName` on the `CreatorProfile` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[introVideoAssetId]` on the table `CreatorProfile` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "CreatorWorkMode" AS ENUM ('FULL_TIME', 'PART_TIME');

-- AlterTable
ALTER TABLE "CreatorProfile" DROP COLUMN "displayName",
ADD COLUMN     "addressLine1" TEXT,
ADD COLUMN     "addressLine2" TEXT,
ADD COLUMN     "bio" TEXT,
ADD COLUMN     "city" TEXT,
ADD COLUMN     "country" TEXT,
ADD COLUMN     "equipment" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "fullName" TEXT,
ADD COLUMN     "instagram" TEXT,
ADD COLUMN     "introVideoAssetId" TEXT,
ADD COLUMN     "nicheGroup" TEXT,
ADD COLUMN     "niches" TEXT[] DEFAULT ARRAY[]::TEXT[],
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "portfolioUrl" TEXT,
ADD COLUMN     "postalCode" TEXT,
ADD COLUMN     "price30sCents" INTEGER,
ADD COLUMN     "tiktok" TEXT,
ADD COLUMN     "workMode" "CreatorWorkMode";

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_introVideoAssetId_key" ON "CreatorProfile"("introVideoAssetId");

-- CreateIndex
CREATE INDEX "CreatorProfile_introVideoAssetId_idx" ON "CreatorProfile"("introVideoAssetId");

-- AddForeignKey
ALTER TABLE "CreatorProfile" ADD CONSTRAINT "CreatorProfile_introVideoAssetId_fkey" FOREIGN KEY ("introVideoAssetId") REFERENCES "Asset"("id") ON DELETE SET NULL ON UPDATE CASCADE;
