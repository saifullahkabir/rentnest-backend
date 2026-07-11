-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "RentalRequestStatus" ADD VALUE 'ACTIVE';
ALTER TYPE "RentalRequestStatus" ADD VALUE 'COMPLETED';

-- AlterTable
ALTER TABLE "payments" ALTER COLUMN "transactionId" DROP NOT NULL,
ALTER COLUMN "stripeSessionId" DROP NOT NULL;
