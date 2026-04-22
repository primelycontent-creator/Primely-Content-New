-- CreateTable
CREATE TABLE "UserSettings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "inAppNotifications" BOOLEAN NOT NULL DEFAULT true,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "notifyNewBrief" BOOLEAN NOT NULL DEFAULT true,
    "notifyCreatorUpload" BOOLEAN NOT NULL DEFAULT true,
    "notifyStaffChanges" BOOLEAN NOT NULL DEFAULT true,
    "notifyBrandChanges" BOOLEAN NOT NULL DEFAULT true,
    "notifyApprovals" BOOLEAN NOT NULL DEFAULT true,
    "notifySupport" BOOLEAN NOT NULL DEFAULT true,
    "deleteRequestedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserSettings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserSettings_userId_key" ON "UserSettings"("userId");

-- CreateIndex
CREATE INDEX "UserSettings_userId_idx" ON "UserSettings"("userId");

-- AddForeignKey
ALTER TABLE "UserSettings" ADD CONSTRAINT "UserSettings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
