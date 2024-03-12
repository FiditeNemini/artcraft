import React, { useCallback, useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";
import { Button } from "components/common";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { useParams, useHistory } from "react-router-dom";
import { useInferenceJobs } from "hooks";
import { EnqueueEngineCompositing } from "@storyteller/components/src/api/engine_compositor/EnqueueEngineCompositing";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { v4 as uuidv4 } from "uuid";
import "./StudioIntro.scss";
import Scene3D from "components/common/Scene3D/Scene3D";
import { EngineMode } from "components/common/Scene3D/EngineMode";

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

  // If the user saves the scene in the engine, we'll need to use the new token 
  // for subsequent steps of this flow.
  const [savedMediaToken, setSavedMediaToken] = useState(mediaToken);

  usePrefixedDocumentTitle("Storyteller Studio");

  const onSaveCallback = useCallback((sceneMediaToken: string) => {
    setSavedMediaToken(sceneMediaToken);
  }, [setSavedMediaToken]);

  if (!props.sessionWrapper.canAccessStudio()) {
    return <StudioNotAvailable />;
  }

  let assetDescriptor;

  // We should prefer to start the onboarding flow with an existing scene, but if 
  // one is unavailable, we should show the sample room.
  if (mediaToken) {
    assetDescriptor = {
      storytellerSceneMediaFileToken: mediaToken,
    };
  } else {
    assetDescriptor = {
      objectId: "sample-room.gltf",
    };
  }

  const onClick = () => {
    // This opens the job modal. Needs to be disabled.
    EnqueueEngineCompositing("", {
      uuid_idempotency_token: uuidv4(),
      media_file_token: savedMediaToken,
    }).then((res: any) => {
      if (res && res.success) {
        inferenceJobs.enqueue(res.inference_job_token, true); // noModalPls = true
        history.push(`/studio-intro/style/${res.inference_job_token}`);
      }
    });
  };

  return (
    <div className="studio-intro-page">
      <Scene3D
        fullScreen={true}
        mode={EngineMode.Studio}
        asset={assetDescriptor}
        className="flex-grow-1"
        onSceneSavedCallback={onSaveCallback}
      />
      <div className="d-flex justify-content-center p-3">
        <Button label="Create Movie from 3D Scene" onClick={onClick} />
      </div>
    </div>
  );
}

export { StudioIntroPage };
