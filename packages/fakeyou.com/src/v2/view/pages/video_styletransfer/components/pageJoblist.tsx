import React, { memo } from "react";
import { NavLink } from "react-router-dom";

import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { Analytics } from "common/Analytics";
import { Button, Spinner } from "components/common";
import { states, Action, State } from "../reducer";
import { inferenceFailures } from "../commons";

export default memo(function PageWorkflowJoblist({
  t,
  pageState,
  dispatchPageState,
  parentPath,
}: {
  debug?: boolean;
  t: Function;
  pageState: State;
  parentPath: string;
  dispatchPageState: (action: Action) => void;
}) {
  return (
    <>
      <div className="row mb-3">
        <NavLink to={`${parentPath}`}>
          <Button label={t("button.generateNew")} variant="primary" />
        </NavLink>
      </div>
      {pageState.status === states.JOB_ENQUEUEING && (
        <div>
          <h2>t("message.requestingJob")</h2>
          <Spinner />
        </div>
      )}
      <InferenceJobsList
        {...{
          showNoJobs: true,
          failures: inferenceFailures,
          onSelect: () => Analytics.voiceConversionClickDownload(),
          jobType: FrontendInferenceJobType.VideoStyleTransfer,
        }}
      />
    </>
  );
});
