import React, { useReducer, useEffect } from "react";
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
import PageVideoMocapProgress from "./components/pageVideoMocapProgress";
import VideoMocapJobList from "./components/videoMocapJobList";
import {states, reducer} from './videoMocapReducer';

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
  const { NO_FILE, FILE_UPLOADING, MOCAPNET_ENQUEUED } = states;
  const [pageState, dispatchPageState] = useReducer(reducer, {status: NO_FILE});

  useEffect(()=>{
    if (pageState.status === states.MOCAPNET_ENQUEUED && pageState.inferenceJobToken){
      enqueueInferenceJob(
        pageState.inferenceJobToken,
        FrontendInferenceJobType.VideoMotionCapture
      );
      dispatchPageState({
        type: 'enqueueMocapNetSuccess', 
        payload:{inferenceJobToken: undefined}
      });
    }
      
  }, [pageState])
  const { pathname } = useLocation();

  if (pathname === `/video-mocap` || pathname === `/video-mocap/`) {
    return <Redirect to={`/video-mocap/upload`} />;
  }

  const tabs = [
    {
      label: t("tabTitle.upload"),
      content: <TabContentUpload {...{t, pageState, dispatchPageState}} />,
      to: "/video-mocap/upload",
      padding: true,
    },
    {
      label: t("tabTitle.library"),
      content: <TabContentLibrary {...{t, pageState, dispatchPageState}} />,
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
          { pageState.status < FILE_UPLOADING && <>
              <div className="col-12 col-md-6">
                <Tabs tabs={tabs}/>
              </div>
              <div className="col-12 col-md-6">
              <Panel padding={true} clear={true}>
                <BasicVideo
                  title="Video -> Mocap Sample"
                  src="/videos/face-animator-instruction-en.mp4"
                />
              </Panel>
            </div>
          </>}
          { pageState.status >= FILE_UPLOADING && pageState.status < MOCAPNET_ENQUEUED &&
            <div className="col-12" >
              <PageVideoMocapProgress {...{t, pageState, dispatchPageState}} />
            </div>
          }
          { pageState.status === MOCAPNET_ENQUEUED &&
            <div className="col-12" >
              <h2 className="p-3 m-0">{t("tab.message.mocapNetRequestSucceed")}</h2>
            </div>
          }
        </div>
        {/*2nd row*/}
      </Panel>
      {/*panel*/}
      <VideoMocapJobList />
    </Container>
  );
}
