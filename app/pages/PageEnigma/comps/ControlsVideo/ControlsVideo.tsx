import { useContext } from "react";
import {
  faBackwardStep,
  faForwardStep,
  faPlay,
  faPause,
} from "@fortawesome/pro-solid-svg-icons";
import { ButtonIcon } from "~/components";
import { EngineContext } from "~/pages/PageEnigma/contexts/EngineContext";
import { currentTime, filmLength } from "~/pages/PageEnigma/signals";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import { useSignals } from "@preact/signals-react/runtime";
import { editorState } from "~/pages/PageEnigma/signals/engine";
import { EditorStates } from "~/pages/PageEnigma/enums";

// const SCALE_VALUES = [0.5, 1, 1.25, 1.5, 1.75, 2];
// enum ScaleAdjustment {
//   UP,
//   DOWN,
// }

export const ControlsVideo = () => {
  useSignals();
  const editorEngine = useContext(EngineContext);
  // const scaleIndex = useRef(1);
  // const canPlayback = editorEngine !== null && editorEngine.can_playback;
  // console.log(`canplayback is ${canPlayback}`);
  const isPlaying =
    editorEngine !== null ? editorEngine.timeline.is_playing : false;

  const handleBackwardStep = () => {
    currentTime.value = Math.max(currentTime.value - 1, 0);
    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.UPDATE_TIME,
      data: { currentTime: currentTime.value },
    });
  };
  const handlePlayback = () => {
    editorEngine?.togglePlayback();
  };
  const handleForwardStep = () => {
    currentTime.value = Math.min(currentTime.value + 1, filmLength.value * 60);
    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.UPDATE_TIME,
      data: { currentTime: currentTime.value },
    });
  };

  if (editorState.value === EditorStates.PREVIEW) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div className="rounded-t-lg bg-ui-controls p-2 text-white shadow-md">
        <div className="flex content-center gap-2">
          <ButtonIcon
            // disabled={!canPlayback}
            icon={faBackwardStep}
            onClick={handleBackwardStep}
          />
          <ButtonIcon
            // disabled={!canPlayback}
            icon={isPlaying ? faPause : faPlay}
            onClick={handlePlayback}
          />
          <ButtonIcon
            // disabled={!canPlayback}
            icon={faForwardStep}
            onClick={handleForwardStep}
          />
        </div>
      </div>
    </div>
  );
};
