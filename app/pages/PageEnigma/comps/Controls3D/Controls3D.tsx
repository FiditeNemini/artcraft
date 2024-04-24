import {
  faAngleRight,
  faArrowsRotate,
  faArrowsUpDownLeftRight,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/pro-solid-svg-icons";
import { Button, ButtonIconSelect } from "~/components";
import { EngineContext } from "~/contexts/EngineContext";
import { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Pages } from "~/pages/PageEnigma/constants/page";

interface Props {
  setPage: (page: Pages) => void;
}

export const Controls3D = ({ setPage }: Props) => {
  const editorEngine = useContext(EngineContext);

  const handleMoveArrows = () => {
    if (!editorEngine) {
      return;
    }
    editorEngine.change_mode("translate");
  };
  const handleRotateArrows = () => {
    if (!editorEngine) {
      return;
    }
    editorEngine.change_mode("rotate");
  };
  const handleZoomArrows = () => {
    if (!editorEngine) {
      return;
    }
    editorEngine.change_mode("scale");
  };

  const handleModeChange = (value: string) => {
    switch (value) {
      case "move":
        handleMoveArrows();
        break;
      case "rotate":
        handleRotateArrows();
        break;
      case "scale":
        handleZoomArrows();
        break;
      default:
        console.log("Unknown option");
    }
  };

  const changeStylize = () => {
    editorEngine?.switchPreview();
    setPage(Pages.STYLE);
  };

  const modes = [
    { value: "move", icon: faArrowsUpDownLeftRight },
    { value: "rotate", icon: faArrowsRotate },
    { value: "scale", icon: faUpRightAndDownLeftFromCenter },
  ];

  return (
    <div>
      <div className="flex justify-center">
        <div className="rounded-b-lg border-x border-b border-ui-panel-border bg-ui-controls p-2 text-white">
          <div className="flex items-center justify-center gap-3">
            <ButtonIconSelect
              options={modes}
              onOptionChange={handleModeChange}
            />

            <span className="h-6 w-0 border-l border-white/[0.2]" />

            <Button variant="primary" onClick={() => changeStylize()}>
              Stylize <FontAwesomeIcon icon={faAngleRight} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
