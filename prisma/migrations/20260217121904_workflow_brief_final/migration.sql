/*
  Warnings:

  - You are about to drop the column `acceptedPrivacyAt` on the `Brief` table. All the data in the column will be lost.
  - You are about to drop the column `acceptedTosAt` on the `Brief` table. All the data in the column will be lost.
  - You are about to drop the column `licenseNote` on the `Brief` table. All the data in the column will be lost.
  - You are about to drop the column `licenseTerm` on the `Brief` table. All the data in the column will be lost.
  - You are about to drop the column `niche` on the `Brief` table. All the data in the column will be lost.
  - You are about to drop the column `privacyVersion` on the `Brief` table. All the data in the column will be lost.
  - You are about to drop the column `tosVersion` on the `Brief` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Brief_contactEmail_idx";

-- DropIndex
DROP INDEX "Brief_niche_idx";

-- AlterTable
ALTER TABLE "Brief" DROP COLUMN "acceptedPrivacyAt",
DROP COLUMN "acceptedTosAt",
DROP COLUMN "licenseNote",
DROP COLUMN "licenseTerm",
DROP COLUMN "niche",
DROP COLUMN "privacyVersion",
DROP COLUMN "tosVersion",
ADD COLUMN     "license" "LicenseTerm",
ALTER COLUMN "companyName" DROP NOT NULL,
ALTER COLUMN "contactName" DROP NOT NULL,
ALTER COLUMN "contactEmail" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Deliverable_briefId_idx" ON "Deliverable"("briefId");

-- CreateIndex
CREATE INDEX "Deliverable_creatorId_idx" ON "Deliverable"("creatorId");

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
