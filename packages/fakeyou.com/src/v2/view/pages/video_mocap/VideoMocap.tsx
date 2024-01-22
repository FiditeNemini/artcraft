import React, { useState } from "react";
import { Redirect, useLocation } from "react-router-dom";

import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import {
  FrontendInferenceJobType,
  InferenceJob,
} from "@storyteller/components/src/jobs/InferenceJob";
import { PageInferenceStatuses } from "./components/pageInferenceStatuses";

import { BasicVideo, Container, Panel } from "components/common";
import PageHeader from "components/layout/PageHeader";
import Tabs from "components/common/Tabs";
import { useLocalize } from "hooks";

import TabContentUpload from "./components/tabContentUpload";
import TabContentLibrary from "./components/tabContentLibrary";

export default function VideoMotionCapture(props: {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
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
    VIDEO_PROVISION,
    SHOW_JOB_STATUS,
  }
  const { VIDEO_PROVISION, SHOW_JOB_STATUS } = pageStates;
  const [pageState, setPageState] = useState<{
    index: number;
    inputMediaToken: string;
    jobToken: string;
    resultMediaToken: string;
  }>({
    index: VIDEO_PROVISION,
    inputMediaToken: "",
    jobToken: "",
    resultMediaToken: "",
  });

  const handlePageState = ({
    tokenType,
    token,
  }: {
    tokenType: string;
    token: string | undefined;
  }) => {
    if (token && tokenType === "jobToken") {
      setPageState({
        ...pageState,
        index: SHOW_JOB_STATUS,
        jobToken: token,
      });
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
          {/*Video Provision Tabs & Job Statuses*/}
          <div className="col-12 col-md-6">
            {pageState.index === VIDEO_PROVISION && <Tabs tabs={tabs} />}
            {pageState.index === SHOW_JOB_STATUS && (
              <PageInferenceStatuses
                {...{
                  t,
                  enqueueInferenceJob,
                  pageStates,
                  pageState,
                  pageStateCallback: handlePageState,
                }}
              />
            )}
          </div>
          {/*ENDS Video Chooser Tabs*/}

          <div className="col-12 col-md-6">
            <Panel padding={true} clear={true}>
              <BasicVideo
                title="Video -> Mocap Sample"
                src="/videos/face-animator-instruction-en.mp4"
              />
            </Panel>
          </div>
        </div>
        {/*2nd row*/}
      </Panel>
      {/*panel*/}
    </Container>
  );
}
