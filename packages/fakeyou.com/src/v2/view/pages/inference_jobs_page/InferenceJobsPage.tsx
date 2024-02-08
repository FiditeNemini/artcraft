import React from "react";
import { InferenceJobsModal } from "components/modals";

export default function InferenceJobsPage() {
  return <div {...{ className: "fy-inference-jobs-list-page p-3"}}>
    <div {...{ className: "panel p-3" }}>
     <InferenceJobsModal />
    </div>
  </div>;
};