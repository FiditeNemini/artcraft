import React, {useReducer } from 'react';

import { useLocalize } from "hooks";
import { FrontendInferenceJobType, InferenceJob } from '@storyteller/components/src/jobs/InferenceJob';

import { Container, ErrorMessage } from "components/common";
import PageHeader from "components/layout/PageHeader";

import PageVideoProvision from './components/pageVideoProvision';
import PageFilterControls from './components/pageFilterControls';
import { states, reducer } from "./storytellerFilterReducer";


export default function StorytellerFilter(props:{
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobs: Array<InferenceJob>;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
}){
  const debug=true;
  const { t } = useLocalize("StorytellerFilter");
  const { NO_FILE, FILE_STAGED, FILE_UPLOADING, FILE_UPLOADED, FILE_LOADING, FILE_LOADED } = states;
  const [pageState, dispatchPageState] = useReducer(reducer, {
    status: NO_FILE,
  });

  const pagePicker = () => {
    switch (pageState.status){
      case NO_FILE:
      case FILE_STAGED:
      case FILE_UPLOADING:
        return <PageVideoProvision {...{debug, t, pageState, dispatchPageState}}/>
      case FILE_UPLOADED:
      case FILE_LOADING:
      case FILE_LOADED:
        return <PageFilterControls {...{debug, t, pageState, dispatchPageState}}/>
      default:
        return <ErrorMessage/>
    }
  }
  const currPage = pagePicker();

  return(
    <Container type="panel" className="mb-5">
      <PageHeader
        title={t("headings.title")}
        subText={t("headings.subtitle")}
        // imageUrl="/images/header/video-mocap.png"
      />
      {currPage}
    </Container>
  );
}