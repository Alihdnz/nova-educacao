-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "passingPercentage" DECIMAL(5,2) NOT NULL DEFAULT 70;

-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "correctAnswers" INTEGER,
ADD COLUMN     "maxScoreSnapshot" DECIMAL(6,2),
ADD COLUMN     "passed" BOOLEAN,
ADD COLUMN     "passingPercentageSnapshot" DECIMAL(5,2),
ADD COLUMN     "percentage" DECIMAL(5,2),
ADD COLUMN     "timeLimitMinutesSnapshot" INTEGER,
ADD COLUMN     "totalQuestions" INTEGER;

-- CreateIndex
CREATE INDEX "Attempt_enrollmentId_assessmentId_status_idx" ON "Attempt"("enrollmentId", "assessmentId", "status");
