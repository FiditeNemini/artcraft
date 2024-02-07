import React, { useState } from "react";
import { EntityInput } from "components/entities";
import { Button } from "components/common";
// import { useInferenceJobs } from "hooks";
// import InferenceJobsList from "components/layout/InferenceJobsList";
// import { EnqueueEngineCompositing } from "@storyteller/components/src/api/engine_compositor/EnqueueEngineCompositing";
// import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
// import { v4 as uuidv4 } from "uuid";

interface Props {
  value?: any;
}

export default function DevMediaInput({ value }: Props) {
  const [mediaToken,mediaTokenSet] = useState();
  const onChange = ({ target }: any) => mediaTokenSet(target.value);
  // const inferenceJobs = useInferenceJobs(FrontendInferenceJobType.EngineComposition);

  // const failures = (fail = "") => {
  //   switch (fail) {
  //     default:
  //       return "Uknown failure";
  //   }
  // };

  return <div {...{ className: "fy-engine-compositor"}}>
    <div {...{ className: "panel engine-compositor-container" }}>
      <header>
        <h2>{ [526,187].map((num = 0) => String.fromCodePoint(128000 + num)) }</h2>
        <Button {...{ label: "Enqueue", variant: "primary" }}/>
      </header>
       <EntityInput {...{ aspectRatio: "landscape", label: "Choose Media File", onChange, weightType: "sd_1.5" }}/>
       <div>
        { mediaToken }
       </div>
    </div>
  {
      // <InferenceJobsList
      //   {...{
      //     failures,
      //     jobType: FrontendInferenceJobType.EngineComposition,
      //   }}
      // />
  }
  </div>;
};