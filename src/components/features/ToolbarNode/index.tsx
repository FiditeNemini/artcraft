import { twMerge } from "tailwind-merge";

import {
  faLockKeyholeOpen,
  faLockKeyhole,
} from "@fortawesome/pro-solid-svg-icons";
import {
  ToolbarButton,
  ToolbarButtonProps,
} from "~/components/features/ToolbarButton";
import { paperWrapperStyles } from "~/components/styles";
import { ToolbarNodeButtonNames } from "./enums";
import { ToolbarNodeButtonData } from "./data";

export interface ToolbarImageProps {
  disabled?: boolean;
  locked?: boolean;
  onLockClicked: (
    e: React.MouseEvent<HTMLButtonElement>,
    currLock: boolean,
  ) => void;
  buttonsProps?: {
    [key in ToolbarNodeButtonNames]: ToolbarButtonProps;
  };
}
export const ToolbarNode = ({
  disabled,
  locked,
  onLockClicked,
  buttonsProps,
}: ToolbarImageProps) => {
  const handleOnLockClicked: React.MouseEventHandler<HTMLButtonElement> = (
    e,
  ) => {
    if (onLockClicked) {
      onLockClicked(e, locked ?? false);
    }
  };
  return (
    <div
      className={twMerge(
        paperWrapperStyles,
        disabled && "pointer-events-none cursor-default bg-ui-border shadow-md",
        "flex gap-2 transition",
      )}
    >
      <ToolbarButton
        tooltip={locked ? "Unlock" : "Lock"}
        icon={locked ? faLockKeyhole : faLockKeyholeOpen}
        onClick={handleOnLockClicked}
      />
      <span className="border-r border-r-ui-border" />
      {ToolbarNodeButtonData.map((buttonDatum, idx) => {
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
