import React, { useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";

import { LoadingDots, TopBar } from "~/components";
import { SidePanel } from "~/pages/PageEnigma/comps/SidePanel";

import { Timeline } from "./comps/Timeline";
import { Controls3D } from "./comps/Controls3D";
import { ControlsTopButtons } from "./comps/ControlsTopButtons";
import { ControlsVideo } from "./comps/ControlsVideo";
import { ControlPanelSceneObject } from "./comps/ControlPanelSceneObject";
import { PreviewEngineCamera } from "./comps/PreviewEngineCamera";
import { PreviewFrameImage } from "./comps/PreviewFrameImage";

import { pageHeight, pageWidth } from "~/signals";

import {
  timelineHeight,
  sidePanelWidth,
  sidePanelVisible,
  dndSidePanelWidth,
  dndTimelineHeight,
  editorLoader,
} from "~/pages/PageEnigma/signals";

export const PageEditor = () => {
  useSignals();

  //To prevent the click event from propagating to the canvas: TODO: HANDLE THIS BETTER?
  const handleOverlayClick = (event: React.MouseEvent<HTMLDivElement>) => {
    event.stopPropagation();
  };

  useEffect(() => {
    timelineHeight.value = window.innerHeight * 0.25;
    sidePanelWidth.value = 340;
    window.onbeforeunload = () => {
      return "You may have unsaved changes.";
    };
  }, []);

  const dndWidth =
    dndSidePanelWidth.value > -1
      ? dndSidePanelWidth.value
      : sidePanelWidth.value;
  const width = sidePanelVisible.value
    ? pageWidth.value - dndWidth - 84
    : pageWidth.value - 84;
  const height =
    dndTimelineHeight.value > -1
      ? pageHeight.value - dndTimelineHeight.value - 68
      : pageHeight.value - timelineHeight.value - 68;

  return (
    <div className="w-screen">
      <TopBar pageName="Edit Scene" />
      <div
        className="relative flex w-screen"
        style={{ height: "calc(100vh - 68px)" }}
      >
        {/* Engine section/side panel */}
        <div
          id="engine-n-panels-wrapper"
          className="flex"
          style={{
            height,
            width,
          }}
        >
          <div className="relative w-full overflow-hidden bg-transparent">
            <div
              id="video-scene-container"
              className="relative"
              style={{
                width:
                  pageWidth.value -
                  (sidePanelVisible.value ? sidePanelWidth.value : 0) -
                  84,
                height: pageHeight.value - timelineHeight.value - 68,
              }}
            >
              <canvas id="video-scene" width="1280px" height="720px" />
              <PreviewFrameImage />
            </div>

            {/* Top controls */}
            <div
              className="absolute left-0 top-0 w-full"
              onClick={handleOverlayClick}
            >
              <div className="grid grid-cols-3 gap-4">
                <ControlsTopButtons />
                <Controls3D />
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
              onClick={handleOverlayClick}
            >
              <PreviewEngineCamera />
              <ControlsVideo />
              <ControlPanelSceneObject />
            </div>

            <LoadingDots
              className="absolute left-0 top-0"
              isShowing={editorLoader.value.isShowing}
              type="bricks"
              message={editorLoader.value.message}
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
