import React, {useReducer, useEffect } from 'react';

import { useInferenceJobs, useLocalize } from "hooks";
import { FrontendInferenceJobType, InferenceJob } from '@storyteller/components/src/jobs/InferenceJob';

import { Container } from "components/common";
import PageHeader from "components/layout/PageHeader";

import { states, reducer } from "./videoWorkflowReducer";
import SubRoutes from "./videoWorkflowRoutes";
import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { StudioNotAvailable } from 'v2/view/_common/StudioNotAvailable';

export default function VideoWorkflow(props:{
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobs: Array<InferenceJob>;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
  sessionWrapper: SessionWrapper;
}){
  const debug = false;
  const {t} = useLocalize("VideoWorkflow");
  const { NO_FILE } = states;
  const [pageState, dispatchPageState] = useReducer(reducer, {
    status: NO_FILE,
  });

  const { enqueueInferenceJob } = props;
  useInferenceJobs(
    FrontendInferenceJobType.VideoWorkflow
  );
  useEffect(() => {
    if (
      pageState.status === states.WORKFLOW_ENQUEUED &&
      pageState.inferenceJobToken
    ) {
      enqueueInferenceJob(
        pageState.inferenceJobToken,
        FrontendInferenceJobType.VideoWorkflow
      );
      dispatchPageState({
        type: "enqueueFilterSuccess",
        payload: { inferenceJobToken: undefined },
      });
    }
  }, [pageState, enqueueInferenceJob]);

  if (!props.sessionWrapper.canAccessStudio()) {
    return <StudioNotAvailable />
  }

  return(
    <Container type="panel" className="mb-5">
      {debug && <p>{`Status:${pageState.status} MediaToken:${pageState.mediaFileToken}`}</p>}
      <PageHeader
        title={t("headings.title")}
        subText={t("headings.subtitle")}
      />

      <SubRoutes {...{debug, t, pageState, dispatchPageState}}/>
    </Container>
  );
}