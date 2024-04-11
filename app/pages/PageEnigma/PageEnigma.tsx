import { PageEnigmaComponent } from "./PageEnigmaComponent";
import { TrackProvider } from "~/pages/PageEnigma/contexts/TrackContext/TrackProvider";
import { AppUIProvider } from "~/pages/PageEnigma/contexts/AppUiContext";
import { EngineProvider } from "~/pages/PageEnigma/contexts/EngineProvider";
import { DragComponent } from "~/pages/PageEnigma/comps/DragComponent/DragComponent";
import { useInferenceJobManager } from "~/hooks";

import { useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import {
  pageHeight,
  pageWidth,
  sidePanelWidth,
  timelineHeight,
} from "~/pages/PageEnigma/store";

export const PageEnigma = () => {
  useSignals();
  useInferenceJobManager();
  useEffect(() => {
    function setPage() {
      // TODO address this issue with zooming
      pageHeight.value = window.innerHeight;
      pageWidth.value = window.outerWidth;
    }
    timelineHeight.value = window.innerHeight * 0.25;
    sidePanelWidth.value = 443;

    setPage();

    window.addEventListener("resize", setPage);

    return () => {
      window.removeEventListener("resize", setPage);
    };
  }, []);

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
