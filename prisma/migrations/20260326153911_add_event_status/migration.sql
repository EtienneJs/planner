-- CreateEnum
CREATE TYPE "EventStatus" AS ENUM ('PENDING', 'NOT_COMPLETED', 'COMPLETED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "status" "EventStatus" NOT NULL DEFAULT 'PENDING';
