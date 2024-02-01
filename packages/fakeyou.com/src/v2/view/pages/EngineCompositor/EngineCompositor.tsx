import React, { useState } from "react";
import { Button, MocapInput } from "components/common";
import { useInferenceJobs } from "hooks";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { EnqueueEngineCompositing } from "@storyteller/components/src/api/engine_compositor/EnqueueEngineCompositing";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { v4 as uuidv4 } from "uuid";
import "./EngineCompositor.scss"

interface Props {
  value?: any;
}

export default function EngineCompositor({ value }: Props) {
  const [mediaToken,mediaTokenSet] = useState();
  const onChange = ({ target }: any) => mediaTokenSet(target.value);
  const inferenceJobs = useInferenceJobs(FrontendInferenceJobType.EngineComposition);

  const onClick = () => {
    EnqueueEngineCompositing("",{
        uuid_idempotency_token: uuidv4(),
        video_source: mediaToken || "",
    })
    .then((res: any) => {
        if (res && res.success) {
          console.log("🚛 success!",{ mediaToken, res });
          inferenceJobs.enqueue( // I need to pass this
            res.inference_job_token,
            FrontendInferenceJobType.EngineComposition
          );

        }
      });
  }

  const failures = (fail = "") => {
    switch (fail) {
      default:
        return "Uknown failure";
    }
  };

  return <div {...{ className: "fy-engine-compositor"}}>
    <div {...{ className: "panel engine-compositor-container" }}>
      <header>
        <h2>Engine Compositor</h2>
        <Button {...{ label: "Enqueue", onClick, variant: "primary" }}/>
      </header>
       <MocapInput {...{ aspectRatio: "landscape", label: "Choose 3D data", onChange, type: "bvh" }}/>
    </div>
      <InferenceJobsList
        {...{
          failures,
          jobType: FrontendInferenceJobType.EngineComposition,
        }}
      />
  </div>;
};