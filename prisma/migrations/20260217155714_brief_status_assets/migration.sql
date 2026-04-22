/*
  Warnings:

  - The `license` column on the `Brief` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- DropIndex
DROP INDEX "Brief_brandId_idx";

-- AlterTable
ALTER TABLE "Asset" ADD COLUMN     "briefId" TEXT,
ADD COLUMN     "fileName" TEXT,
ADD COLUMN     "sizeBytes" INTEGER;

-- AlterTable
ALTER TABLE "Brief" ADD COLUMN     "niches" TEXT[] DEFAULT ARRAY[]::TEXT[],
DROP COLUMN "license",
ADD COLUMN     "license" TEXT;

-- CreateIndex
CREATE INDEX "Asset_briefId_idx" ON "Asset"("briefId");

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;
