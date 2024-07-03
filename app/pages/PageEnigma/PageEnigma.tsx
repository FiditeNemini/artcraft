import { PageEditor } from "~/pages/PageEnigma/PageEditor";
import { TrackProvider } from "~/pages/PageEnigma/contexts/TrackContext/TrackProvider";
import { DragComponent } from "~/pages/PageEnigma/comps/DragComponent/DragComponent";
import { EngineProvider } from "./contexts/EngineContext";
import { useActiveJobs } from "~/hooks/useActiveJobs";
import { useBackgroundLoadingMedia } from "~/hooks/useBackgroundLoadingMedia";
import { useQueueHandler } from "./hooks/useQueueHandler";
import { ErrorDialog, LoadingDots } from "~/components";
import { GenerateModals } from "~/pages/PageEnigma/comps/GenerateModals/GenerateModals";

import { EditorLoadingBar } from "./comps/EditorLoadingBar";
import { useSignals } from "@preact/signals-react/runtime";
import { useEffect, useState } from "react";
import * as gpu from "detect-gpu";
import { TurnOnGpu } from "~/pages/PageEnigma/TurnOnGpu";
export const PageEnigma = ({ sceneToken }: { sceneToken?: string }) => {
  useSignals();
  useActiveJobs();
  useBackgroundLoadingMedia();
  // implement the code to handle incoming messages from the Engine
  useQueueHandler();

  const [validGpu, setValidGpu] = useState("unknown");

  useEffect(() => {
    const { getGPUTier } = gpu;
    getGPUTier().then((gpuTier) => {
      console.log(gpuTier);
      if (gpuTier.gpu === "apple gpu (Apple GPU)") {
        setValidGpu("valid");
      }
      setValidGpu(gpuTier.type !== "BENCHMARK" ? "error" : "valid");
    });
  });

  if (validGpu === "unknown") {
    return <LoadingDots />;
  }
  if (validGpu === "error") {
    return <TurnOnGpu />;
  }

  return (
    <TrackProvider>
      <EngineProvider sceneToken={sceneToken}>
        <PageEditor />
        <DragComponent />
        <GenerateModals />
        <ErrorDialog />
      </EngineProvider>
      <EditorLoadingBar />
    </TrackProvider>
  );
};
