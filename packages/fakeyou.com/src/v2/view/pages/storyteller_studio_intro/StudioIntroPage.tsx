import React from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";
import { Button, Scene3D } from "components/common";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { useParams, useHistory } from "react-router-dom";
import { useInferenceJobs } from "hooks";
import { EnqueueEngineCompositing } from "@storyteller/components/src/api/engine_compositor/EnqueueEngineCompositing";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { v4 as uuidv4 } from "uuid";
import "./StudioIntro.scss";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

function StudioIntroPage(props: Props) {
  const { mediaToken } = useParams<{ mediaToken: string }>();
  const history = useHistory();
  const inferenceJobs = useInferenceJobs(
    FrontendInferenceJobType.EngineComposition
  );

  usePrefixedDocumentTitle("Storyteller Studio");

  if (!props.sessionWrapper.canAccessStudio()) {
    return <StudioNotAvailable />;
  }

  let engineParams = {};

  if (mediaToken) {
    engineParams = {
      sceneMediaFileToken: mediaToken,
    };
  } else {
    engineParams = {
      objectId: "sample-room.gltf",
    };
  }

  const onClick = () => {
    // This opens the job modal. Needs to be disabled.
    EnqueueEngineCompositing("", {
      uuid_idempotency_token: uuidv4(),
      media_file_token: mediaToken || "",
    }).then((res: any) => {
      if (res && res.success) {
        inferenceJobs.enqueue(res.inference_job_token,true); // noModalPls = true
        history.push(`/studio-intro/style/${res.inference_job_token}`);
      }
    });
  };

  return (
    <div className="studio-intro-page">
      <Scene3D
        fullScreen={true}
        mode="studio"
        className="flex-grow-1"
        {...engineParams}
      />
      <div className="d-flex justify-content-center p-3">
        <Button label="Create Movie from 3D Scene" onClick={onClick} />
      </div>
    </div>
  );
}

export { StudioIntroPage };
