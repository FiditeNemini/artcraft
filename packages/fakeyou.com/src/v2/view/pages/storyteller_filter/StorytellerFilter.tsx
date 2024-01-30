import React, {useReducer } from 'react';

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


import { useInferenceJobs, useLocalize } from "hooks";
import { FrontendInferenceJobType, InferenceJob } from '@storyteller/components/src/jobs/InferenceJob';

import { BasicVideo, Button, Container, Panel, Tabs } from "components/common";
import PageHeader from "components/layout/PageHeader";

import TabContentUpload from "./components/tabContentUpload";
import TabContentLibrary from "./components/tabContentLibrary";

import { states, reducer } from "./storytellerFilterReducer";


export default function StorytellerFilter(props:{
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobs: Array<InferenceJob>;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
}){
  const { t } = useLocalize("StorytellerFilter");
  const { NO_FILE, FILE_UPLOADING, FILE_LOADED } = states;
  const [pageState, dispatchPageState] = useReducer(reducer, {
    status: NO_FILE,
  });

  const tabs = [
    {
      label: t("tabTitle.upload"),
      content: <TabContentUpload {...{ t, pageState, dispatchPageState }} />,
      to: "/storyteller-filter/upload",
      padding: true,
    },
    {
      label: t("tabTitle.library"),
      content: <TabContentLibrary {...{ t, pageState, dispatchPageState }} />,
      to: "/storyteller-filter/select-media",
      padding: true,
    },
  ];

  return(
    <Container type="panel" className="mb-5">
      <PageHeader
        title={t("headings.title")}
        subText={t("headings.subtitle")}
        // imageUrl="/images/header/video-mocap.png"
      />
      <Panel>
        <div className="row g-0">
          <div className="col-12 col-md-6">

            <Tabs tabs={tabs} />

          </div>
          <div className="col-12 col-md-6">
            <Panel padding={true} clear={true}>
              <BasicVideo
                title={t("video.sample")}
                src="/videos/face-animator-instruction-en.mp4"
              />
            </Panel>
          </div>
        </div>
      </Panel>
    </Container>
  );
}