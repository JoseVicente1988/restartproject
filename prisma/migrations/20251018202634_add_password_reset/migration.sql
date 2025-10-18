-- CreateTable
CREATE TABLE "PasswordReset" (
    "token" TEXT NOT NULL,
    "userId" BIGINT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PasswordReset_pkey" PRIMARY KEY ("token")
);

-- CreateIndex
CREATE INDEX "PasswordReset_userId_expiresAt_idx" ON "PasswordReset"("userId", "expiresAt");
