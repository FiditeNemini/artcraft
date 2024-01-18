import React, { useState, useEffect } from "react";

import { useLocalize } from "hooks";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { FrontendInferenceJobType,  InferenceJob } from "@storyteller/components/src/jobs/InferenceJob";

import { PageVideoProvision } from "./components/pageVideoProvision";
import { PageInferenceStatuses } from "./components/pageInferenceStatuses";
import { BasicVideo } from "components/common";

export default function VideoMotionCapture(props: {
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper,
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void,
  inferenceJobs: Array<InferenceJob>,
  inferenceJobsByCategory: Map<FrontendInferenceJobType, Array<InferenceJob>>,
}){

  const { enqueueInferenceJob } = props;
  const { t } = useLocalize("VideoMotionCapture");
  enum pageStates { VIDEO_PROVISION, SHOW_JOB_STATUS }
  const { VIDEO_PROVISION, SHOW_JOB_STATUS} = pageStates;
  const [pageState, setPageState] = useState<{
    index:number,
    inputMediaToken: string,
    jobToken: string,
    resultMediaToken: string
  }>({ index: VIDEO_PROVISION, inputMediaToken: "", jobToken: "", resultMediaToken: ""});
  
  const handlePageState = (
    {tokenType, token }:{tokenType:string, token:string | undefined}
  ) => {
    if(token && tokenType == "jobToken"){
      setPageState({
        ...pageState,
        index: SHOW_JOB_STATUS,
        jobToken: token
      })
    }
  }

  return (
    <div className="container-panel py-4">
      <div className="panel p-4">
        
        {/*Header section*/}
        <div className="row g-5">
          <h1 className="fw-bold">{t("headings.title")}</h1>
          <p className="fa-light-txt opacity-75 mt-1">{t("headings.subtitle")}</p>
        </div>

        
        <div className="row g-5 mt-1">

          {/*Video Provision Tabs & Job Statuses*/}
          <div className="col-12 col-md-6">
            { pageState.index === VIDEO_PROVISION && 
              <PageVideoProvision
                t={t}
                pageStateCallback={handlePageState}
              />
            }
            { pageState.index === SHOW_JOB_STATUS && 
              <PageInferenceStatuses
                {...{
                  t,
                  enqueueInferenceJob,
                  pageStates,
                  pageState,
                  pageStateCallback: handlePageState
                }}
              />
            }
          </div>
          {/*ENDS Video Chooser Tabs*/}
          
          <div className="col-12 col-md-6">
            <BasicVideo
              title="Video -> Mocap Sample"
              src="/videos/face-animator-instruction-en.mp4"
            />
          </div>

        </div>{/*2nd row*/}

      </div>{/*panel*/}
    </div>
  )
}
