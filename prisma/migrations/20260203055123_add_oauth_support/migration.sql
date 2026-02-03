-- AlterTable
ALTER TABLE "user" ADD COLUMN     "provider" TEXT DEFAULT 'credentials',
ALTER COLUMN "password" SET DEFAULT '';

-- CreateIndex
CREATE INDEX "user_email_idx" ON "user"("email");

-- CreateIndex
CREATE INDEX "user_role_idx" ON "user"("role");

-- CreateIndex
CREATE INDEX "user_provider_idx" ON "user"("provider");
