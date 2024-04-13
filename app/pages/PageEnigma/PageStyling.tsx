import { useSignals } from "@preact/signals-react/runtime";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faAngleLeft,
  faArrowsRotate,
  faFilm,
} from "@fortawesome/pro-solid-svg-icons";
import { Button, LoadingBar } from "~/components";
import { StyleSelection } from "~/pages/PageEnigma/comps/StyleSelection";
import { TimerGrid } from "~/pages/PageEnigma/comps/Timeline/TimerGrid";
import { Scrubber } from "~/pages/PageEnigma/comps/Timeline/Scrubber";
import { PreviewImages } from "~/pages/PageEnigma/comps/PreviewImages";
import { TopBar } from "~/modules/TopBar";
import React, { UIEvent, useCallback, useContext } from "react";
import { EngineContext } from "~/contexts/EngineContext";
import {
  currentTime,
  filmLength,
  scale,
  timelineScrollX,
} from "~/pages/PageEnigma/store";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

interface Props {
  setPage: (page: string) => void;
}
import { AppUiContext } from "~/contexts/AppUiContext";
export const PageStyling = ({ setPage }: Props) => {
  useSignals();
  const editorEngine = useContext(EngineContext);
  const [appUiState] = useContext(AppUiContext);

  const generateFrame = async () => {
    await editorEngine?.generateFrame();
  };

  const generateMovie = async () => {
    await editorEngine?.generateVideo();
  };

  const switchEdit = () => {
    editorEngine?.switchEdit();
    setPage("edit");
  };

  const onScroll = useCallback((event: UIEvent<HTMLDivElement>) => {
    timelineScrollX.value = event.currentTarget.scrollLeft;
  }, []);

  const onTimelineClick = useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (event.button === 0) {
        const newTime = Math.round(
          (event.clientX + timelineScrollX.value - 92) / 4 / scale.value,
        );
        if (newTime < 0) {
          return;
        }
        currentTime.value = newTime;
        Queue.publish({
          queueName: QueueNames.TO_ENGINE,
          action: toEngineActions.UPDATE_TIME,
          data: { currentTime: Math.round(newTime) },
        });
      }
    },
    [],
  );

  return (
    <div className="w-screen">
      <TopBar pageName="Stylization" />
      <div className="flex w-full justify-center">
        <div className="rounded-b-lg bg-ui-controls p-2">
          <Button variant="action" onClick={() => switchEdit()}>
            <FontAwesomeIcon icon={faAngleLeft} />
            Back to Scene
          </Button>
        </div>
      </div>
      <div className="mt-5 flex flex-col items-center gap-6">
        <PreviewImages />
        <div className="flex flex-col items-center">
          <StyleSelection />
          <div className="flex w-full justify-center gap-4 rounded-b-lg bg-ui-panel pb-5">
            <Button
              icon={faArrowsRotate}
              variant="action"
              onClick={generateFrame}>
              Update Preview
            </Button>
            <Button icon={faFilm} variant="primary" onClick={generateMovie}>
              Generate Movie
            </Button>
          </div>
        </div>
      </div>
      <div className="fixed bottom-0 left-0 w-full">
        <div className="relative flex h-[80px] w-full gap-5 border-t border-t-action-600 bg-ui-panel">
          <div className="w-screen overflow-x-auto" onScroll={onScroll}>
            <div
              style={{
                width: filmLength.value * 60 * 4 * scale.value,
                height: 60,
              }}
              onClick={onTimelineClick}>
              <TimerGrid />
              <Scrubber />
            </div>
          </div>
        </div>
      </div>
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
  );
};
