import { useCallback, useEffect, useRef, useReducer } from "react";

import { faSparkles } from "@fortawesome/pro-solid-svg-icons";

import { Button } from "~/components";
import { TopBarHelmet } from "~/modules/TopBarHelmet/TopBarHelmet";
import { SidePanel } from "~/modules/SidePanel";
import { Controls3D } from "./comps/Controls3D";
import { ControlsTopButtons } from "./comps/ControlsTopButtons";
import { ControlsVideo } from "./comps/ControlsVideo";
import { PreviewEngineCamera } from "./comps/PreviewEngineCamera";
import { Timeline } from "./comps/Timeline";
import { SidePanelTabs } from "./comps/SidePanelTabs";

import { EngineProvider } from "./contexts/EngineProvider";
import { AppUIProvider } from "./contexts/AppUiContext";
import { reducer, initialState, ACTION_TYPES } from "./reducer";
import { VIEW_MODES } from "./reducer/types";

export const PageEnigmaComponent = () => {
  const [pageState, dispatchPageState] = useReducer(reducer, initialState);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // const [timelineHeight, setTimelineHeight] = useState(260);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const updateTimelineHeight = useCallback(() => {
    if (timelineRef.current) {
      dispatchPageState({
        type: ACTION_TYPES.ON_TIMELINE_RESIZE,
        payload: {
          timelineHeight: timelineRef.current.offsetHeight
        }
      })
    }
  }, []);

  //for updating timeline/engine div height (for resizing)
  useEffect(() => {
    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        updateTimelineHeight();
      }
    });

    if (timelineRef.current) {
      observer.observe(timelineRef.current);
    }

    return () => observer.disconnect();
  }, [updateTimelineHeight]);

  return (
    <div>
      <TopBarHelmet>
        <Button icon={faSparkles}>Generate Movie</Button>
      </TopBarHelmet>
      
      <EngineProvider>
        <AppUIProvider value={[pageState, dispatchPageState]} >
          <div style={{ height: "calc(100vh - 68px)" }}>
            {/* Engine section/side panel */}
            <div
              id="CanvasUiWrapper"
              className="flex"
              style={{ height: `calc(100% - ${pageState.timelineHeight}px)` }}
              // style={{ height: `calc(100% - 260px` }}
            >
              <div className="relative w-full overflow-hidden bg-gray-400">
                <canvas
                  ref={canvasRef}
                  id="video-scene"
                  width="1280px"
                  height="720px"
                  className={(
                    pageState.viewMode !== VIEW_MODES.EDITOR)
                    ? 'invisible' : ''
                  }
                />

                {/* Top controls */}
                <div className="absolute left-0 top-0 w-full">
                  <div className="grid grid-cols-3 gap-4">
                    <ControlsTopButtons />
                    <Controls3D />
                  </div>
                </div>

                {/* Bottom controls */}
                <div className="absolute bottom-0 left-0 w-full">
                  <PreviewEngineCamera />
                  <ControlsVideo />
                </div>
              </div>

              {/* Side panel */}
              <SidePanel>
                <SidePanelTabs />
              </SidePanel>
            </div>

            {/* Timeline */}
            <Timeline timelineHeight={pageState.timelineHeight} />
          </div>
        </AppUIProvider>
      </EngineProvider>
    </div>
  );
};
