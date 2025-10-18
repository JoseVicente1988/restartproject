/*
  Warnings:

  - You are about to drop the column `goalId` on the `FeedPost` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "FeedPost_goalId_idx";

-- DropIndex
DROP INDEX "FeedPost_userId_idx";

-- AlterTable
ALTER TABLE "FeedPost" DROP COLUMN "goalId";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "securityAnswerHash" TEXT,
ADD COLUMN     "securityQuestion" TEXT;

-- CreateTable
CREATE TABLE "PasswordReset" (
    "id" BIGSERIAL NOT NULL,
    "userId" BIGINT NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PasswordReset_token_key" ON "PasswordReset"("token");

-- CreateIndex
CREATE INDEX "PasswordReset_userId_expiresAt_idx" ON "PasswordReset"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "FeedPost_userId_id_idx" ON "FeedPost"("userId", "id");
