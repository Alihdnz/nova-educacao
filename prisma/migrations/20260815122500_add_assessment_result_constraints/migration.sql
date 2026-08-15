ALTER TABLE "Assessment"
ADD CONSTRAINT "Assessment_passingPercentage_check"
CHECK ("passingPercentage" >= 0 AND "passingPercentage" <= 100);

ALTER TABLE "Attempt"
ADD CONSTRAINT "Attempt_result_ranges_check"
CHECK (
  ("score" IS NULL OR "score" >= 0)
  AND ("maxScoreSnapshot" IS NULL OR "maxScoreSnapshot" > 0)
  AND ("percentage" IS NULL OR ("percentage" >= 0 AND "percentage" <= 100))
  AND (
    "passingPercentageSnapshot" IS NULL
    OR ("passingPercentageSnapshot" >= 0 AND "passingPercentageSnapshot" <= 100)
  )
  AND ("correctAnswers" IS NULL OR "correctAnswers" >= 0)
  AND ("totalQuestions" IS NULL OR "totalQuestions" >= 0)
  AND (
    "correctAnswers" IS NULL
    OR "totalQuestions" IS NULL
    OR "correctAnswers" <= "totalQuestions"
  )
  AND ("timeLimitMinutesSnapshot" IS NULL OR "timeLimitMinutesSnapshot" > 0)
);

CREATE UNIQUE INDEX "Attempt_one_in_progress_per_assessment"
ON "Attempt"("enrollmentId", "assessmentId")
WHERE "status" = 'IN_PROGRESS';
