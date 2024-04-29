import { useContext, useRef } from "react";
import {
  faBackwardStep,
  faForwardStep,
  faPlay,
} from "@fortawesome/pro-solid-svg-icons";
import { ButtonIcon } from "~/components";
import { EngineContext } from "~/contexts/EngineContext";
import { currentTime, filmLength } from "~/pages/PageEnigma/store";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import { useSignals } from "@preact/signals-react/runtime";
import { editorState, EditorStates } from "~/pages/PageEnigma/store/engine";

const SCALE_VALUES = [0.5, 1, 1.25, 1.5, 1.75, 2];
enum ScaleAdjustment {
  UP,
  DOWN,
}

export const ControlsVideo = () => {
  useSignals();
  const editorEngine = useContext(EngineContext);
  const scaleIndex = useRef(1);

  const handleBackwardStep = () => {
    currentTime.value = Math.max(currentTime.value - 1, 0);
    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.UPDATE_TIME,
      data: { currentTime: currentTime.value },
    });
  };
  const handlePlay = () => {
    editorEngine?.startPlayback();
  };
  const handleForwardStep = () => {
    currentTime.value = Math.min(currentTime.value + 1, filmLength.value * 60);
    Queue.publish({
      queueName: QueueNames.TO_ENGINE,
      action: toEngineActions.UPDATE_TIME,
      data: { currentTime: currentTime.value },
    });
  };

  // const adjustScale = useCallback((adjustment: ScaleAdjustment) => {
  //   if (adjustment === ScaleAdjustment.UP) {
  //     console.log(scaleIndex.current, SCALE_VALUES.length);
  //     if (scaleIndex.current === SCALE_VALUES.length - 1) {
  //       return;
  //     }
  //     console.log(44);
  //     scale.value = SCALE_VALUES[scaleIndex.current + 1];
  //     scaleIndex.current = scaleIndex.current + 1;
  //     return;
  //   }
  //   if (scaleIndex.current === 0) {
  //     return;
  //   }
  //   scale.value = SCALE_VALUES[scaleIndex.current - 1];
  //   scaleIndex.current = scaleIndex.current - 1;
  // }, []);

  if (editorState.value === EditorStates.PREVIEW) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <div className="rounded-t-lg border-x border-t border-ui-panel-border bg-ui-controls p-2 text-white">
        <div className="flex content-center gap-2">
          <ButtonIcon icon={faBackwardStep} onClick={handleBackwardStep} />
          <ButtonIcon icon={faPlay} onClick={handlePlay} />
          <ButtonIcon icon={faForwardStep} onClick={handleForwardStep} />
          {/*<ButtonIcon*/}
          {/*  onClick={() => adjustScale(ScaleAdjustment.DOWN)}*/}
          {/*  icon={faMagnifyingGlassMinus}*/}
          {/*  disabled={scale.value === 0.5}*/}
          {/*/>*/}
          {/*<ButtonIcon*/}
          {/*  onClick={() => adjustScale(ScaleAdjustment.UP)}*/}
          {/*  icon={faMagnifyingGlassPlus}*/}
          {/*/>*/}
        </div>
      </div>
    </div>
  );
};
