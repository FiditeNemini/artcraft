import { PageEditor } from "~/pages/PageEnigma/PageEditor";
import { TrackProvider } from "~/pages/PageEnigma/contexts/TrackContext/TrackProvider";
import { DragComponent } from "~/pages/PageEnigma/comps/DragComponent/DragComponent";
import { EngineProvider } from "./contexts/EngineContext";
import { useInferenceJobManager } from "~/hooks";
import { ErrorDialog, LoadingBar } from "~/components";
import { GenerateModals } from "~/pages/PageEnigma/comps/GenerateModals/GenerateModals";

export const PageEnigma = ({ sceneToken }: { sceneToken?: string }) => {
  useInferenceJobManager();
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
