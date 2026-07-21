-- AlterTable
ALTER TABLE "Provider" ADD COLUMN "email" TEXT,
ADD COLUMN "password" TEXT;

-- CreateIndex
CREATE UNIQUE INDEX "Provider_email_key" ON "Provider"("email");
