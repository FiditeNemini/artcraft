import {
  faArrowsRotate,
  faArrowsUpDownLeftRight,
  faPlus,
  faUpRightAndDownLeftFromCenter,
} from "@fortawesome/pro-solid-svg-icons";
import {
  fa3dCylinder,
  fa3dTorus,
  fa3dSphere,
} from "@awesome.me/kit-fde2be5eb0/icons/kit/custom";
import { ButtonIcon, ButtonIconSelect } from "~/components";

export const Controls3D = () => {
  const handlePlus = () => {
    console.log("Controls 3D: Plus button clicked");
  };
  const handleCylinder = () => {
    console.log("Controls 3D: Cylinder button clicked");
  };
  const handleTorus = () => {
    console.log("Controls 3D: Torus Button clicked");
  };
  const handleSphere = () => {
    console.log("Controls 3D: Sphere Button clicked");
  };
  const handleMoveArrows = () => {
    console.log("Controls 3D: Move Arrows clicked");
  };
  const handleRotateArrows = () => {
    console.log("Controls 3D: Rotate Arrows clicked");
  };
  const handleZoomArrows = () => {
    console.log("Controls 3D: Zoom Arrows clicked");
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

  const modes = [
    { value: "move", icon: faArrowsUpDownLeftRight },
    { value: "rotate", icon: faArrowsRotate },
    { value: "scale", icon: faUpRightAndDownLeftFromCenter },
  ];

  return (
    <div>
      <div className="flex justify-center">
        <div className="rounded-b-lg border-x border-b border-ui-panel-border bg-ui-controls p-2 text-white">
          <div className="flex items-center justify-center gap-2">
            <ButtonIcon icon={faPlus} onClick={handlePlus} fill={true} />

            <span className="h-4 w-0 border-l border-white/[0.15]" />

            <div className="flex gap-1">
              <ButtonIcon icon={fa3dCylinder} onClick={handleCylinder} />
              <ButtonIcon icon={fa3dTorus} onClick={handleTorus} />
              <ButtonIcon icon={fa3dSphere} onClick={handleSphere} />
            </div>

            <span className="h-4 w-0 border-l border-white/[0.15]" />

            <ButtonIconSelect
              options={modes}
              onOptionChange={handleModeChange}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
