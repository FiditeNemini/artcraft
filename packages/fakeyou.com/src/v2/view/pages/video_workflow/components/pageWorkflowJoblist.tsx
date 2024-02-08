import React, { memo } from 'react'

import { Analytics } from "common/Analytics";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { states, Action, State } from "../videoWorkflowReducer";
import { Spinner } from 'components/common';

function VideoWorkflowJobList(){
  const failures = (fail = "") => {
    switch (fail) {
      case "sample case": 
        return "Sample Case, this should not have been shown";
      default:
        return "Unknown failure";
    }
  };

  return (
    <InferenceJobsList {...{
      failures,
      onSelect: () => Analytics.voiceConversionClickDownload(),
      jobType: FrontendInferenceJobType.VideoWorkflow,
    }}/>
  );
}

export default memo (function PageWorkflowJoblist({
  t, pageState, dispatchPageState
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  dispatchPageState: (action: Action) => void;
}) {
  console.log(pageState);
  return(
    <>
      <h1>Jobs</h1>
      {pageState.status === states.WORKFLOW_ENQUEUEING &&
        <div>
          <h2> Requesting Filter Job</h2>
          <Spinner />
        </div>
      }
      <VideoWorkflowJobList />
    </>
  );
});