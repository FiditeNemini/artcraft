import React from 'react'

import { Analytics } from "common/Analytics";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";

export function PageInferenceStatuses (props:{
  t: Function,
  pageStates: Object,
  pageStateCallback: (data:{nextState:number, token?:string}) => void
}){
  const { t } = props;

  const failures = (fail = "") => {
    switch (fail) {
      case "sample case": 
        return "Sample Case, this should not have been shown";
      default:
        return "Unknown failure";
    }
  };

  return(
    <div className="p3">
      <h2>{t("tab.message.mocapNetRequestSucceed")}</h2>
      
      <InferenceJobsList {...{
        failures,
        onSelect: () => Analytics.voiceConversionClickDownload(),
        jobType: FrontendInferenceJobType.VideoMotionCapture,
      }}/>
    </div>
  )
}