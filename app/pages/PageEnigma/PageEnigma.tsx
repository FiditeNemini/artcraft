import { PageEditor } from "~/pages/PageEnigma/PageEditor";
import { TrackProvider } from "~/pages/PageEnigma/contexts/TrackContext/TrackProvider";
import { DragComponent } from "~/pages/PageEnigma/comps/DragComponent/DragComponent";
import { EngineProvider } from "./contexts/EngineContext";
import { useInferenceJobManager, useActiveJobs } from "~/hooks";
import { useQueueHandler } from "./hooks/useQueueHandler";
import { ErrorDialog, LoadingBar } from "~/components";
import { GenerateModals } from "~/pages/PageEnigma/comps/GenerateModals/GenerateModals";
import { useBackgroundLoadingMedia } from "~/hooks/useBackgroundLoadingMedia";

export const PageEnigma = ({ sceneToken }: { sceneToken?: string }) => {
  useInferenceJobManager();
  useActiveJobs();
  useBackgroundLoadingMedia();

  // implement the code to handle incoming messages from the Engine
  useQueueHandler();

  return (
    <TrackProvider>
      <EngineProvider sceneToken={sceneToken}>
        <PageEditor />
        <DragComponent />
        <GenerateModals />
        <ErrorDialog />
      </EngineProvider>
      <LoadingBar
        id="editor-loading-bar"
        wrapperClassName="absolute top-0 left-0 z-20"
        innerWrapperClassName="max-w-screen-sm"
      />
    </TrackProvider>
  );
};
