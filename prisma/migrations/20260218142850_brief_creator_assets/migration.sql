/*
  Warnings:

  - You are about to drop the column `fileKey` on the `Deliverable` table. All the data in the column will be lost.
  - You are about to drop the `Assignment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BriefAsset` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `bucket` to the `Deliverable` table without a default value. This is not possible if the table is not empty.
  - Added the required column `path` to the `Deliverable` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_briefId_fkey";

-- DropForeignKey
ALTER TABLE "Assignment" DROP CONSTRAINT "Assignment_creatorId_fkey";

-- DropForeignKey
ALTER TABLE "BriefAsset" DROP CONSTRAINT "BriefAsset_assetId_fkey";

-- DropForeignKey
ALTER TABLE "BriefAsset" DROP CONSTRAINT "BriefAsset_briefId_fkey";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "briefId" TEXT;

-- AlterTable
ALTER TABLE "Brief" ADD COLUMN     "creatorId" TEXT,
ALTER COLUMN "status" SET DEFAULT 'SUBMITTED';

-- AlterTable
ALTER TABLE "Deliverable" DROP COLUMN "fileKey",
ADD COLUMN     "bucket" TEXT NOT NULL,
ADD COLUMN     "path" TEXT NOT NULL;

-- DropTable
DROP TABLE "Assignment";

-- DropTable
DROP TABLE "BriefAsset";

-- CreateIndex
CREATE INDEX "Asset_briefId_idx" ON "Asset"("briefId");

-- CreateIndex
CREATE INDEX "Brief_brandId_idx" ON "Brief"("brandId");

-- CreateIndex
CREATE INDEX "Brief_creatorId_idx" ON "Brief"("creatorId");

-- CreateIndex
CREATE INDEX "Deliverable_briefId_idx" ON "Deliverable"("briefId");

-- CreateIndex
CREATE INDEX "Deliverable_creatorId_idx" ON "Deliverable"("creatorId");

-- AddForeignKey
ALTER TABLE "Brief" ADD CONSTRAINT "Brief_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;
