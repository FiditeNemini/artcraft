import React, { useCallback, useEffect, useState } from "react";
import { SessionWrapper } from "@storyteller/components/src/session/SessionWrapper";
import { SessionSubscriptionsWrapper } from "@storyteller/components/src/session/SessionSubscriptionsWrapper";
import { StudioNotAvailable } from "v2/view/_common/StudioNotAvailable";
import { BasicTabs, Spinner } from "components/common";
import { usePrefixedDocumentTitle } from "common/UsePrefixedDocumentTitle";
import { useHistory, useParams, useLocation } from "react-router-dom";
import { useInferenceJobs, useMedia } from "hooks";
import { EnqueueEngineCompositing } from "@storyteller/components/src/api/engine_compositor/EnqueueEngineCompositing";
import { FrontendInferenceJobType } from "@storyteller/components/src/jobs/InferenceJob";
import { jobStateCanChange } from "@storyteller/components/src/jobs/JobStates";
import { v4 as uuidv4 } from "uuid";
import Scene3D from "components/common/Scene3D/Scene3D";
import { EngineMode } from "components/common/Scene3D/EngineMode";
import { SplitFirstPeriod } from "utils/SplitFirstPeriod";
import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";

import StyleEditor from "./StyleEditor";

import { initialValues } from "../storyteller_studio_intro/StudioVST/defaultValues";
import { VSTType } from "../storyteller_studio_intro/StudioVST/helpers";

import "./StudioTutorial.scss";

import {
  EnqueueVST,
  EnqueueVSTResponse,
} from "@storyteller/components/src/api/video_styleTransfer/Enqueue_VST";

interface Props {
  sessionWrapper: SessionWrapper;
  sessionSubscriptionsWrapper: SessionSubscriptionsWrapper;
}

export default function StudioTutorial(props: Props) {
  // NB: The URL parameter might be a raw media token (for .scn.ron files), or it might
  // have an appended suffix to assist the engine in loading the correct scene format.
  // For example, this is a valid "mediaTokenSpec": `m_zk0qkm1tgsdbh6e3c9kedy34vaympd.glb`
  const { mediaToken: mediaTokenSpec } = useParams<{ mediaToken: string }>();

  const [vstValues, setVstValues] = useState<VSTType>({
    ...initialValues,
    // fileToken: job?.maybe_result?.entity_token || "",
  });

  const { base: mediaToken, maybeRemainder: maybeExtension } =
    SplitFirstPeriod(mediaTokenSpec);

  // for updating url state

  const history = useHistory();
  const { pathname, search: locSearch } = useLocation();
  const urlQueries = new URLSearchParams(locSearch);
  const queryCompositeJob = urlQueries.get("compositeJobToken");
  const queryStyleJob = urlQueries.get("styleJobToken");

  // side bar tab state

  const [selectedTab, selectedTabSet] = useState("");

  // for both jobs

  const { enqueue, inferenceJobs = [] } = useInferenceJobs();

  // engine compositor job state

  const [compositeJobToken, compositeJobTokenSet] = useState(
    queryCompositeJob || ""
  );
  const compositeJobStatus = inferenceJobs.find(
    (item: any) => item.jobToken === compositeJobToken
  );
  const compositing =
    compositeJobStatus && jobStateCanChange(compositeJobStatus.jobState);
  const compositeMediaToken = compositeJobStatus?.maybeResultToken || "";
  const [refreshedCompositor, refreshedCompositorSet] = useState(false);

  // video style style transfer job state

  const [styleJobToken, styleJobTokenSet] = useState(queryStyleJob || "");
  const [styleEnqueued, styleEnqueuedSet] = useState(false);
  const styleJobStatus = inferenceJobs.find(
    (item: any) => item.jobToken === styleJobToken
  );
  const styling = styleJobStatus && jobStateCanChange(styleJobStatus.jobState);
  const styleMediaToken = styleJobStatus?.maybeResultToken || "";
  const [refreshedStyle, refreshedStyleSet] = useState(false);

  const { media: styleMedia } = useMedia({
    mediaToken: styleMediaToken,
  });

  const styleMediaLink =
    styleMediaToken &&
    styleMedia &&
    new BucketConfig().getGcsUrl(styleMedia?.public_bucket_path || "");

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

  const [
    camera,
    // cameraSet
  ] = useState("zoom");

  usePrefixedDocumentTitle("Storyteller Studio");

  const onSaveCallback = useCallback(
    (sceneMediaToken: string) => {
      setSavedMediaToken(sceneMediaToken);
      sceneIsSavedSet(true); // Just in case we missed the "scene loaded" event.
    },
    [setSavedMediaToken, sceneIsSavedSet]
  );

  const onSceneReadyCallback = useCallback(() => {
    sceneIsLoadedCountSet(sceneIsLoadedCount + 1);
  }, [sceneIsLoadedCount, sceneIsLoadedCountSet]);

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
        let newURLQueries = new URLSearchParams({
          compositeJobToken: res.inference_job_token,
        }).toString();

        history.replace({ pathname, search: newURLQueries });
        // enqueue(res.inference_job_token,false,FrontendInferenceJobType.EngineComposition);
        compositeJobTokenSet(res.inference_job_token);
      }
    });
  };

  const tabs = [
    { value: "animation", label: "Animation" },
    { value: "camera", label: "Camera" },
    { value: "audio", label: "Audio" },
    { value: "style", label: "Style" },
  ];

  const sceneIsLoaded = sceneIsLoadedCount > 0 || sceneIsSaved;

  const workingText = () => {
    if (compositing && !styling) return "Compositing";
    else if (styling && !compositing) return "Styling";
    return "";
  };

  const tabContent = () => {
    if (!sceneIsLoaded || compositing || styling)
      return (
        <div {...{ className: "tutorial-tab-loading" }}>
          <div>
            <h3>{workingText()}</h3>
            <Spinner />
          </div>
        </div>
      );
    else if (styleMediaToken)
      return (
        <div>
          <video controls {...{ src: styleMediaLink }} />
        </div>
      );
    else if (sceneIsLoaded)
      return <StyleEditor {...{ compositorStart, setVstValues, vstValues }} />;
    else return null;
  };

  useEffect(() => {
    const enqueueStyle = () => {
      console.log("💜 style enqueue started", { vstValues, styleEnqueued });
      EnqueueVST("", {
        creator_set_visibility: vstValues.visibility,
        enable_lipsync: true,
        input_file: compositeMediaToken || "",
        negative_prompt: vstValues.negPrompt,
        prompt: "A dog in a sunny field with lots of flowers",
        style: vstValues.sdModelToken,
        trim_end_millis: 3000,
        trim_start_millis: 0,
        uuid_idempotency_token: uuidv4(),
      }).then((res: EnqueueVSTResponse) => {
        console.log("✅", res);
        if (res.success && res.inference_job_token) {
          let newURLQueries = new URLSearchParams({
            compositeJobToken,
            engineJobToken: res.inference_job_token,
          }).toString();
          // enqueue(res.inference_job_token,false,FrontendInferenceJobType.VideoStyleTransfer);
          styleJobTokenSet(res.inference_job_token);
          history.replace({ pathname, search: newURLQueries });
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

    if (sceneIsLoaded && !selectedTab) {
      selectedTabSet("style");
    }

    if (compositeJobToken && !compositeJobStatus && !refreshedCompositor) {
      console.log("🧱", "compositor refreshed");
      refreshedCompositorSet(true);
      enqueue(
        compositeJobToken,
        FrontendInferenceJobType.EngineComposition,
        false
      );
    }

    if (styleJobToken && !styleJobStatus && !refreshedStyle) {
      console.log("🎨", "styler refreshed");
      refreshedStyleSet(true);
      enqueue(
        styleJobToken,
        FrontendInferenceJobType.VideoStyleTransfer,
        false
      );
    }
  }, [
    camera,
    enqueue,
    compositeJobStatus,
    compositeJobToken,
    compositeMediaToken,
    history,
    pathname,
    refreshedCompositor,
    refreshedStyle,
    savedMediaToken,
    selectedTab,
    sceneIsLoaded,
    styleEnqueued,
    styleJobStatus,
    styleJobToken,
    vstValues,
  ]);

  console.log("🚒 tutorial overall state", {
    compositeJobStatus,
    compositing,
    compositeMediaToken,
    queryCompositeJob,
    queryStyleJob,
    sceneIsLoadedCount,
    styleJobStatus,
    styleEnqueued,
    styling,
    styleMediaToken,
    urlQueries,
    styleMediaLink,
  });

  return !props.sessionWrapper.canAccessStudio() ? (
    <StudioNotAvailable />
  ) : (
    <div className="studio-tutorial-page">
      <Scene3D
        {...{
          asset: assetDescriptor,
          mode: EngineMode.Studio,
          onSaveCallback,
          onSceneReadyCallback,
          // overrideURL: "http://127.0.0.1:4200", // COMMENT OUT BEFORE PUSHING
        }}
      />
      <div {...{ className: "studio-tutorial-style" }}>
        <BasicTabs
          {...{
            onChange: ({ target }: { target: any }) =>
              selectedTabSet(target.value),
            tabs,
            value: selectedTab,
          }}
        />
        {tabContent()}
      </div>
    </div>
  );
}
