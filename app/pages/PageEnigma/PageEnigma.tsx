import { useCallback, useEffect, useRef, useState } from "react";

import { faWandSparkles } from "@fortawesome/pro-solid-svg-icons";

import { Button, ButtonLink } from "~/components";
import { ButtonDialogue } from "~/modules/ButtonDialogue";
import { TopBarHelmet } from "~/modules/TopBarHelmet/TopBarHelmet";
import { SidePanel } from "~/modules/SidePanel";
import { Tabs } from "~/modules/Tabs";
import { Controls3D } from "./comps/Controls3D";
import { ControlsVideo } from "./comps/ControlsVideo";
import { Timeline } from "./comps/Timeline";

import Editor from "./js/editor";
import { TrackContext } from "~/contexts/TrackContext";
import { TrackProvider } from "~/contexts/TrackProvider";

export const PageEnigma = () => {
  // const { setTopBarInner } = useContext(TopBarInnerContext) || {};

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const editorRef = useRef<Editor | null>(null);
  const [timelineHeight, setTimelineHeight] = useState(0);
  const timelineRef = useRef<HTMLDivElement | null>(null);

  const editorCallback = useCallback(() => {
    // handle editorCallback here
  }, []);

  useEffect(() => {
    //componentDidMount

    if (editorRef.current == null) {
      editorRef.current = new Editor();
      editorRef.current.initialize();
    }
  }, []);

  const handleButtonSave = () => {
    editorRef.current?.save();
  };

  const handleButtonCameraView = () => {
    editorRef.current?.change_camera_view();
  };

  const handleButtonPlayBack = () => {
    editorRef.current?.start_playback();
  };

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
        <Button icon={faWandSparkles}>Generate Movie</Button>
      </TopBarHelmet>

      <div style={{ height: "calc(100vh - 68px)" }}>
        {/* Engine section/side panel */}
        <div
          className="flex"
          style={{ height: `calc(100% - ${timelineHeight}px)` }}
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
                <div className="flex gap-2 pl-3 pt-3">
                  <Button variant="secondary" onClick={handleButtonPlayBack}>
                    Toggle Camera View
                  </Button>
                  <Button variant="secondary" onClick={handleButtonSave}>
                    Save Scene
                  </Button>
                  <ButtonDialogue
                    buttonProps={{
                      variant: "secondary",
                      label: "Help",
                    }}
                    title="Help"
                  >
                    <p>Do you need help?</p>
                    <p>Ask Michael about this project</p>
                    <p>Ask Miles about ThreeJS</p>
                    <p>Ask Wil about React</p>
                  </ButtonDialogue>
                </div>

                <Controls3D />
              </div>
            </div>

            {/* Bottom controls */}
            <div className="absolute bottom-0 left-0 w-full">
              <ControlsVideo />
            </div>
          </div>

          {/* Side panel */}
          <SidePanel />
        </div>

        {/* Timeline */}
        <div className="min-h-[220px]" ref={timelineRef}>
          <TrackProvider>
            <Timeline editorCurrent={editorRef.current} time={20} />
          </TrackProvider>
        </div>
      </div>
    </div>
  );
};
