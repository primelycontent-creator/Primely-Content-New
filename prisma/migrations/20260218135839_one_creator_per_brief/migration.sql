/*
  Warnings:

  - A unique constraint covering the columns `[briefId]` on the table `Assignment` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Assignment_briefId_creatorId_key";

-- CreateIndex
CREATE UNIQUE INDEX "Assignment_briefId_key" ON "Assignment"("briefId");

-- CreateIndex
CREATE INDEX "Assignment_creatorId_idx" ON "Assignment"("creatorId");
