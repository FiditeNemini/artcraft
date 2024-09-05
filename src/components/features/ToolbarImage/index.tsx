import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faImage } from "@fortawesome/pro-thin-svg-icons";

import { ToolbarButtons } from "~/components/features/ToolbarButtons";
import { paperWrapperStyles } from "~/components/styles";
import { ToolbarImageButtonNames } from "./enums";
import { ToolbarImageButtonData } from "./data";

export const ToolbarImage = ({
  position,
  disabled,
  buttonStates,
}: {
  position: {
    x: number;
    y: number;
  };
  disabled?: boolean;
  buttonStates?: {
    [key in ToolbarImageButtonNames]: {
      disabled: boolean;
    };
  };
}) => {
  console.log(buttonStates);
  return (
    <div
      className={twMerge(
        paperWrapperStyles,
        disabled && "pointer-events-none cursor-default bg-ui-border shadow-md",
        "fixed flex gap-2 transition",
      )}
      style={{
        top: position.y,
        left: position.x,
      }}
    >
      <div className="flex size-10 items-center justify-center rounded-3xl bg-ui-border p-2">
        <FontAwesomeIcon icon={faImage} />
      </div>
      {ToolbarImageButtonData.map((buttonDatum, idx) => {
        const buttonProps =
          buttonStates && buttonStates[buttonDatum.name]
            ? { disabled: buttonStates[buttonDatum.name].disabled }
            : undefined;
        return (
          <ToolbarButtons
            icon={buttonDatum.icon}
            key={idx}
            buttonProps={buttonProps}
          />
        );
      })}
    </div>
  );
};
