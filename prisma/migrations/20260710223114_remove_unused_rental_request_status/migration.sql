/*
  Warnings:

  - The values [ACTIVE,COMPLETED] on the enum `RentalRequestStatus` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "RentalRequestStatus_new" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
ALTER TABLE "public"."rentalRequests" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "rentalRequests" ALTER COLUMN "status" TYPE "RentalRequestStatus_new" USING ("status"::text::"RentalRequestStatus_new");
ALTER TYPE "RentalRequestStatus" RENAME TO "RentalRequestStatus_old";
ALTER TYPE "RentalRequestStatus_new" RENAME TO "RentalRequestStatus";
DROP TYPE "public"."RentalRequestStatus_old";
ALTER TABLE "rentalRequests" ALTER COLUMN "status" SET DEFAULT 'PENDING';
COMMIT;
