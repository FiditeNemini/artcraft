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

import { ButtonIcon } from "~/components";

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
  return (
    <div>
      <div className="flex justify-center">
        <div className="bg-ui-controls rounded-b-md border-x border-b border-ui-panel-border px-4 py-2 text-white">
          <div className="flex gap-4">
            <ButtonIcon icon={faPlus} onClick={handlePlus} />
            <span className="w-0 border-l border-white/[0.1]" />
            <ButtonIcon icon={fa3dCylinder} onClick={handleCylinder} />
            <ButtonIcon icon={fa3dTorus} onClick={handleTorus} />
            <ButtonIcon icon={fa3dSphere} onClick={handleSphere} />
            <span className="w-0 border-l border-white/[0.1]" />
            <ButtonIcon
              icon={faArrowsUpDownLeftRight}
              onClick={handleMoveArrows}
            />
            <ButtonIcon icon={faArrowsRotate} onClick={handleRotateArrows} />
            <ButtonIcon
              icon={faUpRightAndDownLeftFromCenter}
              onClick={handleZoomArrows}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
