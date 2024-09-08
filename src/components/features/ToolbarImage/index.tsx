import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faImage } from "@fortawesome/pro-solid-svg-icons";

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
      <div className="flex size-10 items-center justify-center rounded-3xl bg-ui-border p-2">
        <FontAwesomeIcon icon={faImage} />
      </div>
      {ToolbarImageButtonData.map((buttonDatum, idx) => {
        const buttonProps = buttonsProps?.[buttonDatum.name];

        return (
          <ToolbarButton
            icon={buttonDatum.icon}
            key={idx}
            buttonProps={buttonProps}
          />
        );
      })}
    </div>
  );
};
