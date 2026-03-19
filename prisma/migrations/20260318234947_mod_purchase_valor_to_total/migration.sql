/*
  Warnings:

  - You are about to drop the column `price` on the `Purchase` table. All the data in the column will be lost.
  - Added the required column `total` to the `Purchase` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Purchase" DROP COLUMN "price",
ADD COLUMN     "total" INTEGER NOT NULL;
