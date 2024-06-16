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
import { SplitFirstPeriod } from "utils/SplitFirstPeriod";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

const PAGE_TITLE = "Storyteller Studio";

function StudioIntroPage(props: Props) {
  // NB: The URL parameter might be a raw media token (for .scn.ron files), or it might
  // have an appended suffix to assist the engine in loading the correct scene format.
  // For example, this is a valid "mediaTokenSpec": `m_zk0qkm1tgsdbh6e3c9kedy34vaympd.glb`
  const { mediaToken: mediaTokenSpec } = useParams<{ mediaToken: string }>();

  const { base: mediaToken, maybeRemainder: maybeExtension } =
    SplitFirstPeriod(mediaTokenSpec);

  const history = useHistory();

  const inferenceJobs = useInferenceJobs();

  // If the user saves the scene in the engine, we'll need to use the new token
  // for subsequent steps of this flow.
  const [savedMediaToken, setSavedMediaToken] = useState(mediaToken);

  // We don't show the "next step" buttons until the engine loads.
  // Unfortunately the engine sometimes fires this twice, with one instance
  // being called before the scene loads. Until this is fixed, we'll count the
  // number of event fires and assume we must have two calls.
  const [sceneIsLoadedCount, sceneIsLoadedCountSet] = useState(0);

  // If the scene is saved, we know the user must have interacted.
  // This can serve as a second optional gate for enabling the next steps.
  const [sceneIsSaved, sceneIsSavedSet] = useState(false);

  usePrefixedDocumentTitle(PAGE_TITLE);

  const onSaveCallback = useCallback(
    (sceneMediaToken: string) => {
      console.log(`Saved scene, new media token: ${sceneMediaToken}`);

      setSavedMediaToken(sceneMediaToken);
      sceneIsSavedSet(true); // Just in case we missed the "scene loaded" event.

      // Replace the history state without causing a React re-render
      window.history.replaceState(
        null,
        PAGE_TITLE,
        `/studio-intro/${sceneMediaToken}`
      );
    },
    [setSavedMediaToken, sceneIsSavedSet]
  );

  const onSceneReadyCallback = useCallback(() => {
    sceneIsLoadedCountSet(sceneIsLoadedCount + 1);
  }, [sceneIsLoadedCount, sceneIsLoadedCountSet]);

  if (!props.sessionWrapper.canAccessStudio()) {
    return <StudioNotAvailable />;
  }

  let assetDescriptor;

  // We should prefer to start the onboarding flow with an existing scene, but if
  // one is unavailable, we should show the sample room.
  if (maybeExtension !== undefined) {
    assetDescriptor = {
      sceneImportToken: mediaToken,
      extension: maybeExtension,
    };
  } else if (mediaToken) {
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
      skybox: "meadow_4k",
    }).then((res: any) => {
      if (res && res.success) {
        inferenceJobs.enqueue(
          res.inference_job_token,
          FrontendInferenceJobType.EngineComposition
        );
        history.push(`/studio-intro/style/${res.inference_job_token}`);
      }
    });
  };

  const sceneIsLoaded = sceneIsLoadedCount > 1 || sceneIsSaved;

  let progressButtons = <></>;

  if (sceneIsLoaded) {
    progressButtons = (
      <div {...{ className: "p-3 d-flex justify-content-center" }}>
        <Button label="Create Movie from 3D Scene" onClick={onClick} />
      </div>
    );
  }

  return (
    <div className="studio-intro-page">
      <Scene3D
        fullScreen={true}
        mode={EngineMode.Studio}
        asset={assetDescriptor}
        className="flex-grow-1"
        onSceneReadyCallback={onSceneReadyCallback}
        onSceneSavedCallback={onSaveCallback}
      />

      {progressButtons}
    </div>
  );
}

export { StudioIntroPage };
