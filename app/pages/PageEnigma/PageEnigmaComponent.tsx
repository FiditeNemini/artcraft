import { useEffect, useRef, useReducer } from "react";

import { faSparkles } from "@fortawesome/pro-solid-svg-icons";

import { Button, LoadingDotsBricks } from "~/components";
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
import { ViewSideBySide } from "./comps/ViewSideBySide";

export const PageEnigmaComponent = () => {
  const [appUiState, dispatchAppUiState] = useReducer(reducer, initialState);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(()=>{
    setTimeout(()=>dispatchAppUiState({
      type: ACTION_TYPES.HIDE_EDITOR_LOADER
    }), 500);
  },[]);
  return (
    <div>
      <TopBarHelmet>
        <Button icon={faSparkles}>Generate Movie</Button>
      </TopBarHelmet>
      
      <EngineProvider>
        <AppUIProvider value={[appUiState, dispatchAppUiState]} >
          <div style={{ height: "calc(100vh - 68px)" }}>
            {/* Engine section/side panel */}
            <div
              id="CanvasUiWrapper"
              className="flex"
              style={{ height: `calc(100% - ${appUiState.timelineHeight}px)` }}
              // style={{ height: `calc(100% - 260px` }}
            >
              <div className="relative w-full overflow-hidden bg-transparent">
                <div className={(appUiState.viewMode === VIEW_MODES.SIDE_BY_SIDE) ? 'invisible' : ''}>
                  <canvas
                    ref={canvasRef}
                    id="video-scene"
                    width="1280px"
                    height="720px"
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
                {
                  appUiState.viewMode === VIEW_MODES.SIDE_BY_SIDE &&
                  <ViewSideBySide />
                }
                <LoadingDotsBricks
                  className="absolute top-0 left-0"
                  show={appUiState.showEditorLoader}
                  transition
                />
              </div>
              
              {/* Side panel */}
              <SidePanel>
                <SidePanelTabs />
              </SidePanel>
            </div>

            {/* Timeline */}
            <Timeline timelineHeight={appUiState.timelineHeight} />
          </div>
        </AppUIProvider>
      </EngineProvider>
    </div>
  );
};
