import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faImage } from "@fortawesome/pro-solid-svg-icons";
import { Tooltip } from "~/components/ui";
import {
  ToolbarButton,
  ToolbarButtonProps,
} from "~/components/features/ToolbarButton";
import { paperWrapperStyles } from "~/components/styles";
import { ToolbarImageButtonNames } from "./enums";
import { ToolbarImageButtonData } from "./data";

export interface ToolbarImageProps {
  disabled?: boolean;
  buttonsProps?: {
    [key in ToolbarImageButtonNames]: ToolbarButtonProps;
  };
}
export const ToolbarImage = ({ disabled, buttonsProps }: ToolbarImageProps) => {
  return (
    <div
      className={twMerge(
        paperWrapperStyles,
        disabled && "pointer-events-none cursor-default bg-ui-border shadow-md",
        "flex gap-2 transition",
      )}
    >
      <Tooltip tip="Image Node Management">
        <div className="flex size-10 items-center justify-center border-r border-r-ui-border py-2 pl-2 pr-4">
          <FontAwesomeIcon icon={faImage} />
        </div>
      </Tooltip>
      {ToolbarImageButtonData.map((buttonDatum, idx) => {
        const buttonProps = buttonsProps?.[buttonDatum.name];

        return (
          <ToolbarButton
            icon={buttonDatum.icon}
            tooltip={buttonDatum.tooltip}
            key={idx}
            buttonProps={buttonProps}
          />
        );
      })}
    </div>
  );
};
