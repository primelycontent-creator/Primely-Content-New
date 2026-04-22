/*
  Warnings:

  - You are about to drop the column `briefId` on the `Asset` table. All the data in the column will be lost.
  - You are about to drop the column `creatorId` on the `Brief` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Asset" DROP CONSTRAINT "Asset_briefId_fkey";

-- DropForeignKey
ALTER TABLE "Brief" DROP CONSTRAINT "Brief_creatorId_fkey";

-- DropIndex
DROP INDEX "Asset_briefId_idx";

-- DropIndex
DROP INDEX "Brief_creatorId_idx";

-- AlterTable
ALTER TABLE "Asset" DROP COLUMN "briefId";

-- AlterTable
ALTER TABLE "Brief" DROP COLUMN "creatorId",
ADD COLUMN     "assignedCreatorId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'DRAFT';

-- CreateTable
CREATE TABLE "BriefAsset" (
    "briefId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "BriefAsset_pkey" PRIMARY KEY ("briefId","assetId")
);

-- CreateIndex
CREATE INDEX "BriefAsset_assetId_idx" ON "BriefAsset"("assetId");

-- CreateIndex
CREATE INDEX "Brief_assignedCreatorId_idx" ON "Brief"("assignedCreatorId");

-- AddForeignKey
ALTER TABLE "Brief" ADD CONSTRAINT "Brief_assignedCreatorId_fkey" FOREIGN KEY ("assignedCreatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefAsset" ADD CONSTRAINT "BriefAsset_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefAsset" ADD CONSTRAINT "BriefAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
