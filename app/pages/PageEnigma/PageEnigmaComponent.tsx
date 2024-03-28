import { useReducer } from "react";

import { faSparkles } from "@fortawesome/pro-solid-svg-icons";

import { Button, LoadingBar, LoadingDots } from "~/components";
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
import { appUiReducer, appUiInitialStateValues, APPUI_ACTION_TYPES, APPUI_VIEW_MODES } from "./reducers";
import { ViewSideBySide } from "./comps/ViewSideBySide";

export const PageEnigmaComponent = () => {
  const [appUiState, dispatchAppUiState] = useReducer(appUiReducer, appUiInitialStateValues);
  

  return (
    <div>
      <TopBarHelmet>
        <Button icon={faSparkles}>Generate Movie</Button>
      </TopBarHelmet>
      
      <AppUIProvider value={[appUiState, dispatchAppUiState]} >
        <EngineProvider>
          <div style={{ height: "calc(100vh - 68px)" }}>
            {/* Engine section/side panel */}
            <div
              id="CanvasUiWrapper"
              className="flex"
              style={{ height: `calc(100% - ${appUiState.timelineHeight}px)` }}
              // style={{ height: `calc(100% - 260px` }}
            >
              <div className="relative w-full overflow-hidden bg-transparent">
                <div className={(appUiState.viewMode === APPUI_VIEW_MODES.SIDE_BY_SIDE) ? 'invisible' : ''}>
                  <canvas
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
                  appUiState.viewMode === APPUI_VIEW_MODES.SIDE_BY_SIDE &&
                  <ViewSideBySide />
                }
                <LoadingDots
                  className="absolute top-0 left-0"
                  isShowing={appUiState.showEditorLoader.isShowing}
                  type="bricks"
                  message={appUiState.showEditorLoader.message}
                />
                <LoadingBar
                  id="editor-loading-bar"
                  wrapperClassName="absolute top-0 left-0"
                  innerWrapperClassName="max-w-screen-sm"
                  isShowing={appUiState.showEditorLoadingBar.isShowing}
                  message={appUiState.showEditorLoadingBar.message}
                  label={appUiState.showEditorLoadingBar.label}
                  progress={appUiState.showEditorLoadingBar.progress}
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
        </EngineProvider>
      </AppUIProvider>
    </div>
  );
};
