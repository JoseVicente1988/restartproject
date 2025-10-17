-- AlterTable
ALTER TABLE "FeedPost" ADD COLUMN     "goalId" BIGINT;

-- CreateIndex
CREATE INDEX "FeedPost_goalId_idx" ON "FeedPost"("goalId");
