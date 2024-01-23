import React, { useState } from "react";
import { Redirect, useLocation } from "react-router-dom";

import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";

import { BasicVideo, Container, Panel } from "components/common";
import PageHeader from "components/layout/PageHeader";
import Tabs from "components/common/Tabs";
import { useLocalize } from "hooks";

import TabContentUpload from "./components/tabContentUpload";
import TabContentLibrary from "./components/tabContentLibrary";
import VideoMotionCaptureJobList from "./components/videoMotionCaptureJobList";

export default function VideoMotionCapture(props: {
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void;
  inferenceJobs: Array<InferenceJob>;
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>;
}) {
  const { enqueueInferenceJob } = props;
  const { t } = useLocalize("VideoMotionCapture");
  enum pageStates {
    START,
    VIDEO_PROVISIONING,
    SHOW_JOB_STATUS,
  }
  const { START, VIDEO_PROVISIONING, SHOW_JOB_STATUS } = pageStates;
  const [pageState, setPageState] = useState<number>(START);

  const handlePageState = ({
    nextState,
    token,
  }: {
    nextState: number;
    token?: string;
  }) => {
    if(nextState===VIDEO_PROVISIONING){
      setPageState(VIDEO_PROVISIONING)
    }
    else if (nextState===SHOW_JOB_STATUS && token) {
      enqueueInferenceJob(
        token,
        FrontendInferenceJobType.VideoMotionCapture
      );
      setPageState(SHOW_JOB_STATUS);
    }
  };

  const { pathname } = useLocation();

  if (pathname === `/video-mocap` || pathname === `/video-mocap/`) {
    return <Redirect to={`/video-mocap/upload`} />;
  }

  const tabs = [
    {
      label: t("tabTitle.upload"),
      content: <TabContentUpload t={t} pageStateCallback={handlePageState} />,
      to: "/video-mocap/upload",
      padding: true,
    },
    {
      label: t("tabTitle.library"),
      content: <TabContentLibrary t={t} pageStateCallback={handlePageState} />,
      to: "/video-mocap/select-media",
      padding: true,
    },
  ];

  return (
    <Container type="panel" className="mb-5">
      <PageHeader
        title={t("headings.title")}
        subText={t("headings.subtitle")}
      />
      <Panel>
        <div className="row g-0">
          { pageState !== SHOW_JOB_STATUS &&
              <div className="col-12 col-md-6">
                <Tabs tabs={tabs} disabled={pageState === VIDEO_PROVISIONING}/>
              </div>
          }
          { pageState === START &&
            <div className="col-12 col-md-6">
              <Panel padding={true} clear={true}>
                <BasicVideo
                  title="Video -> Mocap Sample"
                  src="/videos/face-animator-instruction-en.mp4"
                />
              </Panel>
            </div>
          }
          { pageState === SHOW_JOB_STATUS &&
            <div className="col-12" >
              <h2 className="p-3 m-0">{t("tab.message.mocapNetRequestSucceed")}</h2>
            </div>
          }
        </div>
        {/*2nd row*/}
      </Panel>
      {/*panel*/}
      <VideoMotionCaptureJobList />
    </Container>
  );
}
