export const REVIEW_MINIMUM_RESPONSES = 3;

export type ReviewPerformanceKey = "EXCELLENT" | "GOOD" | "ATTENTION" | "REVIEW" | "INSUFFICIENT";

export function reviewPerformance(responses: number, accuracy: number): ReviewPerformanceKey {
  if (responses < REVIEW_MINIMUM_RESPONSES) return "INSUFFICIENT";
  if (accuracy >= 90) return "EXCELLENT";
  if (accuracy >= 70) return "GOOD";
  if (accuracy >= 50) return "ATTENTION";
  return "REVIEW";
}
