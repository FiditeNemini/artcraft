import React, { useEffect } from 'react'

import { Analytics } from "common/Analytics";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";

export function PageInferenceStatuses (props:{
  t: Function,
  pageStates: Object,
  pageState: {
    index:number,
    inputMediaToken: string,
    jobToken: string,
    resultMediaToken: string
  },
  enqueueInferenceJob: (
    jobToken: string,
    frontendInferenceJobType: FrontendInferenceJobType
  ) => void,
  pageStateCallback: (data:{tokenType:string, token:string | undefined}) => void
}){
  const { t, pageState, enqueueInferenceJob } = props;
  useEffect(()=>{
    console.log("ENQUEUE INFERENCE JOB>>")
    enqueueInferenceJob(
      props.pageState.jobToken,
      FrontendInferenceJobType.FaceAnimation
    );
  }, [props.pageState.jobToken, enqueueInferenceJob])

  const failures = (fail = "") => {
    switch (fail) {
      case "sample case": 
        return "Sample Case, this should not have been shown";
      default:
        return "Uknown failure";
    }
  };

  return(
    <>
      <h2>{t("tab.message.mocapNetRequestSucceed")}</h2>
      <h4>Job Token: {pageState.jobToken}</h4>
      
      <InferenceJobsList {...{
        failures,
        onSelect: () => Analytics.voiceConversionClickDownload(),
        jobType: FrontendInferenceJobType.FaceAnimation,
      }}/>
    </>
  )
}