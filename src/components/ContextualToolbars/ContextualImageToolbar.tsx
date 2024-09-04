import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import {
  faArrowsRotate,
  faArrowsUpDownLeftRight,
  faEraser,
  faImage,
  faPaintbrush,
  faTrashCan,
  faWandMagicSparkles,
} from "@fortawesome/pro-thin-svg-icons";
import { ToolbarButtons } from "~/components/features/ToolbarButtons";
import { paperWrapperStyles } from "~/components/styles";

export const ContextualImageToolbar = ({
  position,
}: {
  position: {
    x: number;
    y: number;
  };
}) => {
  return (
    <div
      className={twMerge(paperWrapperStyles, "fixed flex gap-2")}
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="flex size-10 items-center justify-center rounded-3xl bg-ui-border p-2">
        <FontAwesomeIcon icon={faImage} />
      </div>
      <ToolbarButtons icon={faArrowsUpDownLeftRight} />
      <ToolbarButtons icon={faArrowsRotate} />
      <ToolbarButtons icon={faEraser} />
      <ToolbarButtons icon={faPaintbrush} />
      <ToolbarButtons icon={faWandMagicSparkles} />
      <ToolbarButtons icon={faTrashCan} />
    </div>
  );
};
