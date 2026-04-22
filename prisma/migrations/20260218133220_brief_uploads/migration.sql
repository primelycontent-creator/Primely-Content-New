/*
  Warnings:

  - You are about to drop the column `briefId` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `license` on the `Brief` table. All the data in the column will be lost.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "LicenseTerm" ADD VALUE 'M1';
ALTER TYPE "LicenseTerm" ADD VALUE 'UNLIMITED';

-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_briefId_fkey";

-- DropIndex
DROP INDEX "Asset_briefId_idx";

-- DropIndex
DROP INDEX "Deliverable_briefId_idx";

-- DropIndex
DROP INDEX "Deliverable_creatorId_idx";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "briefId";

-- AlterTable
ALTER TABLE "Brief" DROP COLUMN "license",
ADD COLUMN     "licenseTerm" "LicenseTerm",
ADD COLUMN     "nicheGroup" TEXT;

-- CreateTable
CREATE TABLE "BriefAsset" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BriefAsset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "BriefAsset_briefId_idx" ON "BriefAsset"("briefId");

-- CreateIndex
CREATE UNIQUE INDEX "BriefAsset_briefId_assetId_key" ON "BriefAsset"("briefId", "assetId");

-- AddForeignKey
ALTER TABLE "BriefAsset" ADD CONSTRAINT "BriefAsset_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefAsset" ADD CONSTRAINT "BriefAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
