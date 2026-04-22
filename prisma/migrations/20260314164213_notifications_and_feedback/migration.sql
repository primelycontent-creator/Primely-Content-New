-- AlterTable
ALTER TABLE "Brief" ADD COLUMN     "companyName" TEXT,
ADD COLUMN     "contactEmail" TEXT,
ADD COLUMN     "contactName" TEXT,
ADD COLUMN     "contactPhone" TEXT;

-- CreateTable
CREATE TABLE "BriefAsset" (
    "briefId" TEXT NOT NULL,
    "assetId" TEXT NOT NULL,

    CONSTRAINT "BriefAsset_pkey" PRIMARY KEY ("briefId","assetId")
);

-- CreateIndex
CREATE INDEX "BriefAsset_assetId_idx" ON "BriefAsset"("assetId");

-- CreateIndex
CREATE INDEX "Brief_brandId_idx" ON "Brief"("brandId");

-- CreateIndex
CREATE INDEX "Brief_assignedCreatorId_idx" ON "Brief"("assignedCreatorId");

-- CreateIndex
CREATE INDEX "CreatorProfile_introVideoAssetId_idx" ON "CreatorProfile"("introVideoAssetId");

-- CreateIndex
CREATE INDEX "Deliverable_briefId_idx" ON "Deliverable"("briefId");

-- CreateIndex
CREATE INDEX "Deliverable_creatorId_idx" ON "Deliverable"("creatorId");

-- AddForeignKey
ALTER TABLE "BriefAsset" ADD CONSTRAINT "BriefAsset_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BriefAsset" ADD CONSTRAINT "BriefAsset_assetId_fkey" FOREIGN KEY ("assetId") REFERENCES "Asset"("id") ON DELETE CASCADE ON UPDATE CASCADE;
