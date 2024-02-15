import React, {useReducer, useEffect} from 'react';

import { SessionWrapper } from '@storyteller/components/src/session/SessionWrapper';
import { StudioNotAvailable } from 'v2/view/_common/StudioNotAvailable';
import { useInferenceJobs, useLocalize } from "hooks";
import { FrontendInferenceJobType, InferenceJob } from '@storyteller/components/src/jobs/InferenceJob';

import { Container } from "components/common";
import PageHeader from "components/layout/PageHeader";

import { states, reducer } from "./reducer";
import SubRoutes from "./routes";

export default function VideoStyleTransfer(props:{
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobs: Array<InferenceJob>;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
  sessionWrapper: SessionWrapper;
}){
  const debug = true;
  const {t} = useLocalize("VideoStyleTransfer");
  const { NO_FILE } = states;
  const [pageState, dispatchPageState] = useReducer(reducer, {
    status: NO_FILE,
  });

  const { enqueueInferenceJob } = props;
  useInferenceJobs(
    FrontendInferenceJobType.VideoStyleTransfer
  );
  useEffect(() => {
    if (
      pageState.status === states.JOB_ENQUEUED &&
      pageState.inferenceJobToken
    ) {
      enqueueInferenceJob(
        pageState.inferenceJobToken,
        FrontendInferenceJobType.VideoStyleTransfer
      );
      dispatchPageState({
        type: "enqueueJobSuccess",
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