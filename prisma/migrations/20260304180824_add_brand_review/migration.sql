-- CreateEnum
CREATE TYPE "BrandReviewStatus" AS ENUM ('PENDING', 'CHANGES_REQUESTED', 'APPROVED');

-- AlterTable
ALTER TABLE "Deliverable" ADD COLUMN     "brandFeedback" TEXT,
ADD COLUMN     "brandStatus" "BrandReviewStatus" NOT NULL DEFAULT 'PENDING';
