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
  const { enqueueInferenceJob } = props;
  useEffect(()=>{
    console.log("ENQUEUE INFERENCE JOB>>")
    enqueueInferenceJob(
      props.pageState.jobToken,
      FrontendInferenceJobType.VideoMotionCapture
    );
  }, [])

  const failures = (fail = "") => {
    switch (fail) {
      case "sample case": 
        return "Sample Case, this should not have been shown";
      default:
        return "Uknown failure";
    }
  };

  return(
    <InferenceJobsList {...{
      failures,
      onSelect: () => Analytics.voiceConversionClickDownload(),
      jobType: FrontendInferenceJobType.VideoMotionCapture,
    }}/>
  )
}