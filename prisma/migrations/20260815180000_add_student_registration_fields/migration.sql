-- AlterTable
ALTER TABLE "User" ADD COLUMN "birthDate" DATE,
ADD COLUMN "cpf" VARCHAR(11),
ADD COLUMN "firstName" VARCHAR(80),
ADD COLUMN "gender" VARCHAR(32),
ADD COLUMN "lastName" VARCHAR(120),
ADD COLUMN "privacyAcceptedAt" TIMESTAMPTZ(3),
ADD COLUMN "privacyAcceptedVersion" VARCHAR(32),
ADD COLUMN "rg" VARCHAR(20),
ADD COLUMN "termsAcceptedAt" TIMESTAMPTZ(3),
ADD COLUMN "termsAcceptedVersion" VARCHAR(32);

-- CreateIndex
CREATE UNIQUE INDEX "User_cpf_key" ON "User"("cpf");
CREATE UNIQUE INDEX "User_email_lower_key" ON "User"(LOWER("email"));

-- AddConstraint
ALTER TABLE "User" ADD CONSTRAINT "User_cpf_format_check"
CHECK ("cpf" IS NULL OR "cpf" ~ '^[0-9]{11}$');
