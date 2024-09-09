import { twMerge } from "tailwind-merge";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { faFilm } from "@fortawesome/pro-solid-svg-icons";

import {
  ToolbarButton,
  ToolbarButtonProps,
} from "~/components/features/ToolbarButton";
import { paperWrapperStyles } from "~/components/styles";
import { ToolbarVideoButtonNames } from "./enums";
import { ToolbarVideoButtonData } from "./data";

export interface ToolbarVideoProps {
  disabled?: boolean;
  buttonsProps?: {
    [key in ToolbarVideoButtonNames]: ToolbarButtonProps;
  };
}
export const ToolbarVideo = ({ disabled, buttonsProps }: ToolbarVideoProps) => {
  return (
    <div
      className={twMerge(
        paperWrapperStyles,
        disabled && "pointer-events-none cursor-default bg-ui-border shadow-md",
        "flex gap-2 transition",
      )}
    >
      <div className="flex size-10 items-center justify-center rounded-3xl bg-ui-border p-2">
        <FontAwesomeIcon icon={faFilm} />
      </div>
      {ToolbarVideoButtonData.map((buttonDatum, idx) => {
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
