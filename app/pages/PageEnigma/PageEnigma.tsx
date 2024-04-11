import { PageEnigmaComponent } from "./PageEnigmaComponent";
import { TrackProvider } from "~/pages/PageEnigma/contexts/TrackContext/TrackProvider";
import { DragComponent } from "~/pages/PageEnigma/comps/DragComponent/DragComponent";
import { EngineProvider } from "~/contexts/EngineProvider";
import { useInferenceJobManager } from "~/hooks";
export const PageEnigma = () => {
  useInferenceJobManager();
  return (
    <TrackProvider>
      <EngineProvider>
        <PageEnigmaComponent />
        <DragComponent />
      </EngineProvider>
    </TrackProvider>
  );
};
