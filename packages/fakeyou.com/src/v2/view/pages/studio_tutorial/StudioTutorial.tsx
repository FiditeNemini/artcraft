import React, { useCallback, useEffect, useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";
import { NonRouteTabs, Spinner } from "components/common";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { useParams } from "react-router-dom";
import { useInferenceJobs } from "hooks";
import { EnqueueEngineCompositing } from "@storyteller/components/src/api/engine_compositor/EnqueueEngineCompositing";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { jobStateCanChange } from "@storyteller/components/src/jobs/JobStates";
import { v4 as uuidv4 } from "uuid";
import Scene3D from "components/common/Scene3D/Scene3D";
import { EngineMode } from "components/common/Scene3D/EngineMode";
import { SplitFirstPeriod } from "utils/SplitFirstPeriod";

import StyleEditor from "./StyleEditor";

import { initialValues } from "../storyteller_studio_intro/StudioVST/defaultValues";
import { VSTType } from "../storyteller_studio_intro/StudioVST/helpers";


import "./StudioTutorial.scss";


import { EnqueueVST, EnqueueVSTResponse } from "@storyteller/components/src/api/video_styleTransfer/Enqueue_VST";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}


export default function StudioTutorial(props: Props) {
    // NB: The URL parameter might be a raw media token (for .scn.ron files), or it might 
  // have an appended suffix to assist the engine in loading the correct scene format. 
  // For example, this is a valid "mediaTokenSpec": `m_zk0qkm1tgsdbh6e3c9kedy34vaympd.glb`
  const { mediaToken : mediaTokenSpec } = useParams<{ mediaToken: string }>();

  const [vstValues, setVstValues] = useState<VSTType>({
    ...initialValues,
    // fileToken: job?.maybe_result?.entity_token || "",
  });


  const { base: mediaToken, maybeRemainder: maybeExtension } = SplitFirstPeriod(mediaTokenSpec);

  // const history = useHistory();

  const { enqueue, inferenceJobs } = useInferenceJobs();

  const [compositeJobToken,compositeJobTokenSet] = useState("");
  const compositeJobStatus = inferenceJobs.find((item: any) => item.jobToken === compositeJobToken);
  const compositing = compositeJobStatus && jobStateCanChange(compositeJobStatus.jobState);
  const compositeMediaToken = compositeJobStatus?.maybe_result?.entity_token || "";

  const [styleJobToken,styleJobTokenSet] = useState("");
  const [styleEnqueued,styleEnqueuedSet] = useState(false);
  const styleJobStatus = inferenceJobs.find((item: any) => item.jobToken === styleJobToken);
  const styling = styleJobStatus && jobStateCanChange(styleJobStatus.jobState);
  const styleMediaToken = styleJobStatus?.maybe_result?.entity_token || "";

  console.log("🚒",compositeJobStatus,compositing,styling);

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

  const [camera,
    // cameraSet
  ] = useState("zoom");

  usePrefixedDocumentTitle("Storyteller Studio");

  const onSaveCallback = useCallback((sceneMediaToken: string) => {
    setSavedMediaToken(sceneMediaToken);
    sceneIsSavedSet(true); // Just in case we missed the "scene loaded" event.
  }, [setSavedMediaToken, sceneIsSavedSet]);

  const onSceneReadyCallback = useCallback(() => {
    sceneIsLoadedCountSet(sceneIsLoadedCount + 1);
  }, [sceneIsLoadedCount, sceneIsLoadedCountSet])

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

  const compositorStart = () => {
    // This opens the job modal. Needs to be disabled.
    EnqueueEngineCompositing("", {
      uuid_idempotency_token: uuidv4(),
      media_file_token: savedMediaToken,
      camera: camera,
      camera_speed: 0.2,
      skybox: "meadow_4k",
    }).then((res: any) => {
      if (res && res.success) {
        enqueue(res.inference_job_token,false,FrontendInferenceJobType.EngineComposition);
        compositeJobTokenSet(res.inference_job_token)
      }
    });
  };

  const tabs = [
    { content: () => "", label: "Animation" },
    { content: () => "", label: "Camera" },
    { content: () => "", label: "Audio" },
    { content: () => "", label: "Style" }
  ];

  const sceneIsLoaded = sceneIsLoadedCount > 0 || sceneIsSaved;

  const workingText = () => {
    if (compositing) return "Compositing"
    return "";
  }

  const tabContent = () => {
    if (!sceneIsLoaded || compositing || styling) return <div {...{ className: "tutorial-tab-loading" }}>
      <div>
        <h3>{ workingText() }</h3>
        <Spinner />
      </div>
    </div>;
    else if (styleMediaToken) return <div>
      Video Preview here
      { styleMediaToken }
    </div>;
    else if (sceneIsLoaded) return <StyleEditor {...{ compositorStart, setVstValues, vstValues }}/>;
    else return null;
  }

  useEffect(() => {
    const enqueueStyle = () => {
      EnqueueVST("",{
        creator_set_visibility: vstValues.visibility,
        enable_lipsync: true,
        input_file: compositeJobStatus?.maybe_result?.entity_token || "",
        negative_prompt: vstValues.negPrompt,
        prompt: vstValues.posPrompt,
        style: vstValues.sdModelToken,
        trim_end_millis: 3000,
        trim_start_millis: 0,
        uuid_idempotency_token: uuidv4()
      })
      .then((res: EnqueueVSTResponse) => {
        if (res.success && res.inference_job_token) {
          enqueue(res.inference_job_token,false,FrontendInferenceJobType.VideoStyleTransfer);
          styleJobTokenSet(res.inference_job_token);
          // console.log("Job enqueued successfully", res.inference_job_token);
          // history.push(`/studio-intro/result/${res.inference_job_token}`);
        } else {
          console.log("Failed to enqueue job", res);
        }
      });
    };

    if (compositeMediaToken && !styleEnqueued) {
      styleEnqueuedSet(true);
      enqueueStyle();
    }

  },[enqueue,compositeJobStatus,compositeMediaToken,styleEnqueued,vstValues]);


  return !props.sessionWrapper.canAccessStudio() ?
    <StudioNotAvailable /> :
    <div className="studio-tutorial-page">
      <Scene3D
        // fullScreen={true}
        mode={EngineMode.Studio}
        asset={assetDescriptor}
        onSceneReadyCallback={onSceneReadyCallback}
        onSceneSavedCallback={onSaveCallback}
      />
      <div {...{ className: "studio-tutorial-style" }}>
        <NonRouteTabs {...{ tabs }}/>
        {
          tabContent()
        }
      </div>
    </div>;
};
