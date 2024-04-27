import { PageEnigmaComponent } from "./PageEnigmaComponent";
import { TrackProvider } from "~/pages/PageEnigma/contexts/TrackContext/TrackProvider";
import { DragComponent } from "~/pages/PageEnigma/comps/DragComponent/DragComponent";
import { EngineProvider } from "~/contexts/EngineProvider";
import { useInferenceJobManager } from "~/hooks";
import { LoadingBar } from "~/components";
import { MyMovies } from "~/pages/PageEnigma/comps/MyMovies/MyMovies";
import { ErrorDialog } from "~/components/ErrorDialog";

export const PageEnigma = () => {
  useInferenceJobManager();
  return (
    <TrackProvider>
      <EngineProvider>
        <PageEnigmaComponent />
        <DragComponent />
        <MyMovies />
        <ErrorDialog />
      </EngineProvider>
      <LoadingBar
        id="editor-loading-bar"
        wrapperClassName="absolute top-0 left-0"
        innerWrapperClassName="max-w-screen-sm"
      />
    </TrackProvider>
  );
};
