export type AssessmentMutationState = {
  message?: string;
  status: "error" | "idle" | "saved";
};

export const initialAssessmentMutationState: AssessmentMutationState = {
  status: "idle",
};
