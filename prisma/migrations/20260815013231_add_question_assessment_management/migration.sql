-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- AlterTable
ALTER TABLE "Assessment" ADD COLUMN     "maxScore" DECIMAL(6,2) NOT NULL DEFAULT 10,
ADD COLUMN     "timeLimitMinutes" INTEGER;

-- AlterTable
ALTER TABLE "Question" ADD COLUMN     "difficulty" "QuestionDifficulty" NOT NULL DEFAULT 'MEDIUM',
ADD COLUMN     "explanation" TEXT;

-- Domain constraints
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_maxScore_positive" CHECK ("maxScore" > 0);
ALTER TABLE "Assessment" ADD CONSTRAINT "Assessment_timeLimitMinutes_positive" CHECK ("timeLimitMinutes" IS NULL OR "timeLimitMinutes" > 0);
