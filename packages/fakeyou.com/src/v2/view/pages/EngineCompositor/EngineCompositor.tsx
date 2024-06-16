import React, { useState } from "react";
import { Button, Container, Panel } from "components/common";
import { EntityInput } from "components/entities";
import { useInferenceJobs } from "hooks";
import InferenceJobsList from "components/layout/InferenceJobsList";
import { EnqueueEngineCompositing } from "@storyteller/components/src/api/engine_compositor/EnqueueEngineCompositing";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { v4 as uuidv4 } from "uuid";
import "./EngineCompositor.scss";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTransporter } from "@fortawesome/pro-solid-svg-icons";

interface Props {
  value?: any;
  sessionWrapper: SessionWrapper;
}

export default function EngineCompositor({ value, sessionWrapper }: Props) {
  const [mediaToken, mediaTokenSet] = useState();
  const onChange = ({ target }: any) => mediaTokenSet(target.value);
  const { enqueue } = useInferenceJobs();

  const onClick = () => {
    EnqueueEngineCompositing("", {
      uuid_idempotency_token: uuidv4(),
      media_file_token: mediaToken || "",
    }).then((res: any) => {
      if (res && res.success) {
        enqueue(
          res.inference_job_token,
          FrontendInferenceJobType.EngineComposition,
          true
        );
      }
    });
  };

  const failures = (fail = "") => {
    switch (fail) {
      default:
        return "Uknown failure";
    }
  };

  if (!sessionWrapper.canAccessStudio()) {
    return <StudioNotAvailable />;
  }

  return (
    <Container type="panel" className="mt-5">
      <Panel padding={true}>
        <div {...{ className: "fy-engine-compositor" }}>
          <div {...{ className: "engine-compositor-container" }}>
            <header className="d-flex gap-3 flex-wrap">
              <h1 className="fw-semibold">
                <FontAwesomeIcon icon={faTransporter} className="me-3 fs-2" />
                Engine Compositor
              </h1>
              <Button {...{ label: "Enqueue", onClick, variant: "primary" }} />
            </header>
            <EntityInput
              {...{
                accept: ["engine_asset"],
                aspectRatio: "landscape",
                label: "Choose 3D data",
                onChange,
                type: "media",
                value: mediaToken,
              }}
            />
          </div>
          <InferenceJobsList
            {...{
              failures,
              jobType: FrontendInferenceJobType.EngineComposition,
            }}
          />
        </div>
      </Panel>
    </Container>
  );
}
