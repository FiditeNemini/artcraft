import React, {useReducer, useEffect } from 'react';

import { useInferenceJobs, useLocalize } from "hooks";
import { FrontendInferenceJobType, InferenceJob } from '@storyteller/components/src/jobs/InferenceJob';

import { Container } from "components/common";
import PageHeader from "components/layout/PageHeader";

import { states, reducer } from "./storytellerFilterReducer";
import SubRoutes from "./storytellerFilterRoutes";

export default function StorytellerFilter(props:{
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobs: Array<InferenceJob>;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
}){
  const debug=true;
  const {t} = useLocalize("StorytellerFilter");
  const { NO_FILE } = states;
  const [pageState, dispatchPageState] = useReducer(reducer, {
    status: NO_FILE,
  });

  const { enqueueInferenceJob } = props;
  useInferenceJobs(
    FrontendInferenceJobType.StorytellerFilter
  );
  useEffect(() => {
    if (
      pageState.status === states.FILTER_ENQUEUED &&
      pageState.inferenceJobToken
    ) {
      enqueueInferenceJob(
        pageState.inferenceJobToken,
        FrontendInferenceJobType.StorytellerFilter
      );
      dispatchPageState({
        type: "enqueueFilterSuccess",
        payload: { inferenceJobToken: undefined },
      });
    }
  }, [pageState, enqueueInferenceJob]);

  return(
    <Container type="panel" className="mb-5">
      <PageHeader
        title={t("headings.title")}
        subText={t("headings.subtitle")}
      />

      <SubRoutes {...{debug, t, pageState, dispatchPageState}}/>
    </Container>
  );
}