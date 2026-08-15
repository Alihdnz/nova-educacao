import assert from "node:assert/strict";
import test from "node:test";

import { reviewPerformance } from "./student-review-calculation";

test("uses the documented performance thresholds", () => {
  assert.equal(reviewPerformance(2, 0), "INSUFFICIENT");
  assert.equal(reviewPerformance(3, 49.99), "REVIEW");
  assert.equal(reviewPerformance(3, 50), "ATTENTION");
  assert.equal(reviewPerformance(3, 70), "GOOD");
  assert.equal(reviewPerformance(3, 90), "EXCELLENT");
});
