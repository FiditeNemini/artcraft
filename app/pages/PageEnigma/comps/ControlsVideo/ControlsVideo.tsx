import { useContext } from "react";
import {
  faBackwardFast,
  faBackwardStep,
  faForwardFast,
  faForwardStep,
  faPlay,
} from "@fortawesome/pro-solid-svg-icons";
import { ButtonIcon } from "~/components";
import { EngineContext } from "../../../../contexts/EngineContext";

export const ControlsVideo = () => {
  const editorEngine = useContext(EngineContext);

  const handleBackwardFast = () => {
    console.log("Controls Video: Backward-Fast clicked");
  };
  const handleBackwardStep = () => {
    editorEngine?.stepFrame(-1);
  };
  const handlePlay = () => {
    editorEngine?.startPlayback();
  };
  const handleForwardStep = () => {
    editorEngine?.stepFrame(1);
  };
  const handleForwardFast = () => {
    console.log("Controls Video: Forward-Fast clicked");
  };
  return (
    <div className="flex justify-center">
      <div className="rounded-t-lg border-x border-t border-ui-panel-border bg-ui-controls p-2 text-white">
        <div className="flex content-center gap-2">
          <ButtonIcon icon={faBackwardFast} onClick={handleBackwardFast} />
          <ButtonIcon icon={faBackwardStep} onClick={handleBackwardStep} />
          <ButtonIcon icon={faPlay} onClick={handlePlay} />
          <ButtonIcon icon={faForwardStep} onClick={handleForwardStep} />
          <ButtonIcon icon={faForwardFast} onClick={handleForwardFast} />
        </div>
      </div>
    </div>
  );
};
