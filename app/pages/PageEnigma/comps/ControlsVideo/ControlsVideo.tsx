import {
  faBackwardFast,
  faBackwardStep,
  faForwardFast,
  faForwardStep,
  faPlay,
} from "@fortawesome/pro-solid-svg-icons";
import { ButtonIcon } from "~/components";

export const ControlsVideo = () => {
  const handleBackwardFast = () => {
    console.log("Controls Video: Backward-Fast clicked");
  };
  const handleBackwardStep = () => {
    console.log("Controls Video: Backward-Step clicked");
  };
  const handlePlay = () => {
    console.log("Controls Video: Play clicked");
  };
  const handleForwardStep = () => {
    console.log("Controls Video: Forward-Step clicked");
  };
  const handleForwardFast = () => {
    console.log("Controls Video: Forward-Fast clicked");
  };
  return (
    <div>
      <div className="flex justify-center">
        <div className="bg-ui-controls -mt-10 rounded-t-md border-x border-t border-ui-panel-border px-6 py-2 text-white">
          <div className="flex content-center gap-6	">
            <ButtonIcon icon={faBackwardFast} onClick={handleBackwardFast} />
            <ButtonIcon icon={faBackwardStep} onClick={handleBackwardStep} />
            <ButtonIcon className="h-6" icon={faPlay} onClick={handlePlay} />
            <ButtonIcon icon={faForwardStep} onClick={handleForwardStep} />
            <ButtonIcon icon={faForwardFast} onClick={handleForwardFast} />
          </div>
        </div>
      </div>
    </div>
  );
};
