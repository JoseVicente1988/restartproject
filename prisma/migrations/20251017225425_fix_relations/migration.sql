/*
  Warnings:

  - You are about to drop the column `goalId` on the `FeedPost` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FeedPost_userId_createdAt_idx";

-- AlterTable
ALTER TABLE "FeedPost" DROP COLUMN "goalId";

-- CreateIndex
CREATE INDEX "FeedPost_userId_idx" ON "FeedPost"("userId");
