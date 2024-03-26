import { useCallback, useEffect, useRef, useState } from "react";

import { faSparkles } from "@fortawesome/pro-solid-svg-icons";

import { Button } from "~/components";
import { TopBarHelmet } from "~/modules/TopBarHelmet/TopBarHelmet";
import { SidePanel } from "~/modules/SidePanel";
import { Controls3D } from "./comps/Controls3D";
import { ControlsTopButtons } from "./comps/ControlsTopButtons";
import { ControlsVideo } from "./comps/ControlsVideo";
import { PreviewWindow } from "./comps/PreviewWindow";
import { Timeline } from "./comps/Timeline";
import { SidePanelTabs } from "./comps/SidePanelTabs";

import { TrackProvider } from "~/contexts/TrackContext/TrackProvider";
import { EngineProvider } from "~/contexts/EngineProvider";

export const PageEnigmaComponent = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [timelineHeight, setTimelineHeight] = useState(260);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const updateTimelineHeight = useCallback(() => {
    if (timelineRef.current) {
      setTimelineHeight(timelineRef.current.offsetHeight);
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
        <div style={{ height: "calc(100vh - 68px)" }}>
          {/* Engine section/side panel */}
          <div
            id="CanvasUiWrapper"
            className="flex"
            // style={{ height: `calc(100% - ${timelineHeight}px)` }}
            style={{ height: `calc(100% - 260px` }}
          >
            <div className="relative w-full overflow-hidden bg-gray-400">
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
                <PreviewWindow />
                <ControlsVideo />
              </div>
            </div>

            {/* Side panel */}
            <SidePanel>
              <SidePanelTabs />
            </SidePanel>
          </div>

          {/* Timeline */}
          <TrackProvider>
            <Timeline timelineHeight={timelineHeight} />
          </TrackProvider>
        </div>
      </EngineProvider>
    </div>
  );
};
