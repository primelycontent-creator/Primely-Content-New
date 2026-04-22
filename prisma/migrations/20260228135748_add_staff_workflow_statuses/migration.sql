/*
  Warnings:

  - The values [APPROVED] on the enum `BriefStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "BriefStatus_new" AS ENUM ('DRAFT', 'SUBMITTED', 'REVIEW', 'IN_PROGRESS', 'DONE', 'DECLINED');
ALTER TABLE "public"."Brief" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "Brief" ALTER COLUMN "status" TYPE "BriefStatus_new" USING ("status"::text::"BriefStatus_new");
ALTER TYPE "BriefStatus" RENAME TO "BriefStatus_old";
ALTER TYPE "BriefStatus_new" RENAME TO "BriefStatus";
DROP TYPE "public"."BriefStatus_old";
ALTER TABLE "Brief" ALTER COLUMN "status" SET DEFAULT 'DRAFT';
COMMIT;
