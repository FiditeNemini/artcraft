import { useContext } from "react";

import {
  faBackwardFast,
  faBackwardStep,
  faForwardFast,
  faForwardStep,
  faPlay,
} from "@fortawesome/pro-solid-svg-icons";
import { EngineContext } from "../../contexts/EngineContext";
import { ButtonIcon } from "~/components";

export const ControlsVideo = () => {
  const editorEngine = useContext(EngineContext);
  
  const handleBackwardFast = () => {
    console.log("Controls Video: Backward-Fast clicked");
  };
  const handleBackwardStep = () => {
    console.log("Controls Video: Backward-Step clicked");
  };
  const handlePlay = () => {
    console.log("Controls Video: Play clicked");
    editorEngine?.startPlayback();
    
  };
  const handleForwardStep = () => {
    console.log("Controls Video: Forward-Step clicked");
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
