import React, { useContext } from "react";

import { LoadingDots } from "~/components";
import { SidePanel } from "~/modules/SidePanel";

import { Controls3D } from "./comps/Controls3D";
import { ControlsTopButtons } from "./comps/ControlsTopButtons";
import { ControlsVideo } from "./comps/ControlsVideo";
import { ControlPanelSceneObject } from "./comps/ControlPanelSceneObject";
import { PreviewEngineCamera } from "./comps/PreviewEngineCamera";
import { ViewSideBySide } from "./comps/ViewSideBySide";
import { Timeline } from "./comps/Timeline";

import { APPUI_VIEW_MODES } from "../../reducers";
import {
  timelineHeight,
  sidePanelWidth,
  sidePanelVisible,
  dndSidePanelWidth,
  dndTimelineHeight,
  sidePanelHeight,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";
import { AppUiContext } from "~/contexts/AppUiContext";
import { pageHeight, pageWidth } from "~/store";
import { TopBar } from "~/modules/TopBar";
import { DialogueTTS } from "./comps/DialogueTTS/DialogueTTS";
import { Pages } from "~/pages/PageEnigma/constants/page";

interface Props {
  setPage: (page: Pages) => void;
}

export const PageEditor = ({ setPage }: Props) => {
  useSignals();

  const [appUiState] = useContext(AppUiContext);

  //To prevent the click event from propagating to the canvas: TODO: HANDLE THIS BETTER?
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  const dndWidth =
    dndSidePanelWidth.value > -1
      ? dndSidePanelWidth.value
      : sidePanelWidth.value;
  const width = sidePanelVisible.value
    ? pageWidth.value - dndWidth - 66
    : pageWidth.value - 66;
  const height =
    dndTimelineHeight.value > -1
      ? pageHeight.value - dndTimelineHeight.value - 68
      : pageHeight.value - timelineHeight.value - 68;

  return (
    <div className="w-screen">
      <TopBar pageName="Edit Scene" />
      <div
        className="relative flex w-screen"
        style={{ height: "calc(100vh - 68px)" }}>
        {/* Engine section/side panel */}
        <div
          id="engine-n-panels-wrapper"
          className="flex"
          style={{
            height,
            width,
          }}>
          <div className="relative w-full overflow-hidden bg-transparent">
            <div
              className={
                appUiState.viewMode === APPUI_VIEW_MODES.SIDE_BY_SIDE
                  ? "invisible"
                  : ""
              }>
              <div
                id="video-scene-container"
                style={{
                  width:
                    pageWidth.value -
                    (sidePanelVisible.value ? sidePanelWidth.value : 0) -
                    84,
                  height: pageHeight.value - timelineHeight.value - 68,
                }}>
                <canvas id="video-scene" width="1280px" height="720px" />
              </div>

              {/* Top controls */}
              <div
                className="absolute left-0 top-0 w-full"
                onClick={handleOverlayClick}>
                <div className="grid grid-cols-3 gap-4">
                  <ControlsTopButtons />
                  <Controls3D setPage={setPage} />
                </div>
              </div>

              {/* Bottom controls */}
              <div
                className="absolute bottom-0 left-0"
                style={{
                  width:
                    pageWidth.value -
                    (sidePanelVisible.value ? sidePanelWidth.value : 0) -
                    84,
                }}
                onClick={handleOverlayClick}>
                <PreviewEngineCamera />
                <ControlsVideo />
                <ControlPanelSceneObject />
                <DialogueTTS />
              </div>
            </div>
            {appUiState.viewMode === APPUI_VIEW_MODES.SIDE_BY_SIDE && (
              <ViewSideBySide />
            )}
            <LoadingDots
              className="absolute left-0 top-0"
              isShowing={appUiState.showEditorLoader.isShowing}
              type="bricks"
              message={appUiState.showEditorLoader.message}
            />
          </div>
        </div>
        {/* Side panel */}
        <div onClick={handleOverlayClick}>
          <SidePanel />
        </div>
      </div>

      {/* Timeline */}
      <div onClick={handleOverlayClick}>
        <Timeline />
      </div>
    </div>
  );
};
