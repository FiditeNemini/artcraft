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
        <div className="-mt-10 rounded-t-md border-x border-t border-ui-panel-border bg-ui-panel px-6 py-2 text-white">
          <div className="flex content-center gap-6	">
            <ButtonIcon
              className="h-6"
              icon={faBackwardFast}
              onClick={handleBackwardFast}
            />
            <ButtonIcon
              className="h-6"
              icon={faBackwardStep}
              onClick={handleBackwardStep}
            />
            <ButtonIcon className="h-6" icon={faPlay} onClick={handlePlay} />
            <ButtonIcon
              className="h-6"
              icon={faForwardStep}
              onClick={handleForwardStep}
            />
            <ButtonIcon
              className="h-6"
              icon={faForwardFast}
              onClick={handleForwardFast}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
