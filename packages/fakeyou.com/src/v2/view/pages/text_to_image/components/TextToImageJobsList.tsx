import React from "react";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";

export default function TextToImageJobsList() {
  const failures = (fail = "") => {
    switch (fail) {
      case "sample case":
        return "Sample Case, this should not have been shown";
      default:
        return "Unknown failure";
    }
  };

  return (
    <InferenceJobsList
      {...{
        failures,
        jobType: FrontendInferenceJobType.ImageGeneration,
      }}
    />
  );
}
