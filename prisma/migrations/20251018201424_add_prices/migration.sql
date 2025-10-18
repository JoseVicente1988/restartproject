/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Price` table. All the data in the column will be lost.
  - You are about to alter the column `price` on the `Price` table. The data in that column could be lost. The data in that column will be cast from `Decimal(10,2)` to `DoublePrecision`.
  - You are about to drop the column `securityAnswerHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `securityQuestion` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `PasswordReset` table. If the table is not empty, all the data it contains will be lost.
  - A unique constraint covering the columns `[productId,storeId]` on the table `Price` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name]` on the table `Store` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX "Price_updatedAt_idx";

-- DropIndex
DROP INDEX "Store_lat_lng_idx";

-- DropIndex
DROP INDEX "Store_name_idx";

-- AlterTable
ALTER TABLE "Price" DROP COLUMN "updatedAt",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ALTER COLUMN "price" SET DATA TYPE DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "securityAnswerHash",
DROP COLUMN "securityQuestion";

-- DropTable
DROP TABLE "PasswordReset";

-- CreateIndex
CREATE UNIQUE INDEX "Price_productId_storeId_key" ON "Price"("productId", "storeId");

-- CreateIndex
CREATE UNIQUE INDEX "Store_name_key" ON "Store"("name");
