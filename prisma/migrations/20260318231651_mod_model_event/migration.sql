/*
  Warnings:

  - You are about to drop the column `name` on the `Purchase` table. All the data in the column will be lost.
  - Added the required column `description` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `value` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `description` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "description" TEXT NOT NULL,
ADD COLUMN     "value" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "name",
ADD COLUMN     "description" TEXT NOT NULL;
