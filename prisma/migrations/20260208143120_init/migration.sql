-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('BRAND', 'CREATOR', 'STAFF');

-- CreateEnum
CREATE TYPE "LicenseTerm" AS ENUM ('M3', 'M6', 'M12');

-- CreateEnum
CREATE TYPE "DeliverableStatus" AS ENUM ('PENDING', 'CHANGES_REQUESTED', 'APPROVED');

-- CreateEnum
CREATE TYPE "BriefStatus" AS ENUM ('DRAFT', 'SUBMITTED', 'APPROVED', 'DECLINED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BrandProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "companyName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BrandProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CreatorProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "displayName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Brief" (
    "id" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "companyName" TEXT NOT NULL,
    "contactName" TEXT NOT NULL,
    "contactEmail" TEXT NOT NULL,
    "niche" TEXT NOT NULL,
    "licenseTerm" "LicenseTerm" NOT NULL,
    "licenseNote" TEXT,
    "status" "BriefStatus" NOT NULL DEFAULT 'DRAFT',
    "acceptedTosAt" TIMESTAMP(3) NOT NULL,
    "acceptedPrivacyAt" TIMESTAMP(3) NOT NULL,
    "tosVersion" TEXT,
    "privacyVersion" TEXT,
    "deadline" TIMESTAMP(3),
    "contactPhone" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Brief_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Assignment" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Assignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Deliverable" (
    "id" TEXT NOT NULL,
    "briefId" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "status" "DeliverableStatus" NOT NULL DEFAULT 'PENDING',
    "fileKey" TEXT NOT NULL,
    "fileName" TEXT,
    "mimeType" TEXT,
    "sizeBytes" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Deliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Asset" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "bucket" TEXT NOT NULL,
    "path" TEXT NOT NULL,
    "mimeType" TEXT,
    "status" TEXT NOT NULL DEFAULT 'UPLOADED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Asset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BrandProfile_userId_key" ON "BrandProfile"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorProfile_userId_key" ON "CreatorProfile"("userId");

-- CreateIndex
CREATE INDEX "Brief_brandId_idx" ON "Brief"("brandId");

-- CreateIndex
CREATE INDEX "Brief_contactEmail_idx" ON "Brief"("contactEmail");

-- CreateIndex
CREATE INDEX "Brief_niche_idx" ON "Brief"("niche");

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_briefId_creatorId_key" ON "Assignment"("briefId", "creatorId");

-- CreateIndex
CREATE INDEX "Asset_userId_idx" ON "Asset"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Asset_bucket_path_key" ON "Asset"("bucket", "path");

-- AddForeignKey
ALTER TABLE "BrandProfile" ADD CONSTRAINT "BrandProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorProfile" ADD CONSTRAINT "CreatorProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Brief" ADD CONSTRAINT "Brief_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Assignment" ADD CONSTRAINT "Assignment_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Deliverable" ADD CONSTRAINT "Deliverable_briefId_fkey" FOREIGN KEY ("briefId") REFERENCES "Brief"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Asset" ADD CONSTRAINT "Asset_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
