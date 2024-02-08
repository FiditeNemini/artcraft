import React, { useState } from "react";
import { Button } from "components/common";
import { EntityInput } from "components/entities";
import { useInferenceJobs } from "hooks";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { EnqueueEngineCompositing } from "@storyteller/components/src/api/engine_compositor/EnqueueEngineCompositing";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { v4 as uuidv4 } from "uuid";
import "./EngineCompositor.scss"
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";

interface Props {
  value?: any;
  sessionWrapper: SessionWrapper;
}

export default function EngineCompositor({ value, sessionWrapper }: Props) {
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
          inferenceJobs.enqueue(res.inference_job_token);
        }
      });
  }

  const failures = (fail = "") => {
    switch (fail) {
      default:
        return "Uknown failure";
    }
  };

  if (!sessionWrapper.canAccessStudio()) {
    return <StudioNotAvailable />
  }

  return <div {...{ className: "fy-engine-compositor"}}>
    <div {...{ className: "panel engine-compositor-container" }}>
      <header>
        <h2>Engine Compositor</h2>
        <Button {...{ label: "Enqueue", onClick, variant: "primary" }}/>
      </header>
       <EntityInput {...{ aspectRatio: "landscape", label: "Choose 3D data", onChange, mediaType: "bvh" }}/>
    </div>
      <InferenceJobsList
        {...{
          failures,
          jobType: FrontendInferenceJobType.EngineComposition,
        }}
      />
  </div>;
};