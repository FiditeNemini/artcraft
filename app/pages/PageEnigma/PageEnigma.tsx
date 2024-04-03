import { PageEnigmaComponent } from "./PageEnigmaComponent";
import { TrackProvider } from "~/pages/PageEnigma/contexts/TrackContext/TrackProvider";
import { AppUIProvider } from "~/pages/PageEnigma/contexts/AppUiContext";
import { EngineProvider } from "~/pages/PageEnigma/contexts/EngineProvider";
import { DragComponent } from "~/pages/PageEnigma/comps/DragComponent/DragComponent";

export const PageEnigma = () => {
  return (
    <TrackProvider>
      <AppUIProvider>
        <EngineProvider>
          <PageEnigmaComponent />
        </EngineProvider>
      </AppUIProvider>
      <DragComponent />
    </TrackProvider>
  );
};
