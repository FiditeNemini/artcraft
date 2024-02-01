import React, { useState } from "react";
import { Button, MocapInput } from "components/common";
import { EnqueueEngineCompositing } from "@storyteller/components/src/api/engine_compositor/EnqueueEngineCompositing";
import { v4 as uuidv4 } from "uuid";
import "./EngineCompositor.scss"

interface Props {
  value?: any;
}

export default function EngineCompositor({ value }: Props) {
  const [mediaToken,mediaTokenSet] = useState();
  const onChange = ({ target }: any) => mediaTokenSet(target.value);

  const onClick = () => {
    EnqueueEngineCompositing("",{
        uuid_idempotency_token: uuidv4(),
        video_source: mediaToken || "",
    })
    .then((res: any) => {
        if (res && res.success) {
          console.log("🚛 success!",{ mediaToken, res });
          // enqueueInferenceJob( // I need to pass this
          //   res.inference_job_token,
          //   FrontendInferenceJobType.THING
          // );

        }
      });
  }

  return <div {...{ className: "fy-engine-compositor"}}>
    <div {...{ className: "panel engine-compositor-container" }}>
      <header>
        <h2>Engine Compositor</h2>
        <Button {...{ label: "Enqueue", onClick, variant: "primary" }}/>
      </header>
       <MocapInput {...{ aspectRatio: "landscape", label: "Choose 3D data", onChange, type: "bvh" }}/>
    </div>
  </div>;
};