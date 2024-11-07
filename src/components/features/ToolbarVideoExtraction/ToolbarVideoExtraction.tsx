import { twMerge } from "tailwind-merge";
import { faScalpel } from "@fortawesome/pro-solid-svg-icons";
import { LoadingBar, LoadingBarStatus, LoadingBarProps } from "~/components/ui";
import {
  // ToolbarButton,
  ToolbarButtonProps,
} from "~/components/features/ToolbarButton";
import { paperWrapperStyles } from "~/components/styles";
import { ToolbarVideoExtractionButtonNames } from "./enums";
import { Button, Tooltip } from "~/components/ui";

export interface ToolbarVideoExtractionProps {
  disabled?: boolean;
  buttonsProps: {
    [key in ToolbarVideoExtractionButtonNames]: ToolbarButtonProps;
  };
  loadingBarProps?: Partial<LoadingBarProps>;
}
export const ToolbarVideoExtraction = ({
  disabled,
  buttonsProps,
  loadingBarProps,
}: ToolbarVideoExtractionProps) => {
  const loadingBar = {
    colReverse: true,
    progress: 0,
    status: LoadingBarStatus.IDLE,
    message: "Select Points for Extraction",
    ...loadingBarProps,
  };
  return (
    <div
      className={twMerge(
        paperWrapperStyles,
        disabled && "pointer-events-none cursor-default bg-ui-border shadow-md",
        "flex items-center justify-center gap-2 pr-4 transition",
      )}
    >
      <div className="w-72 p-2">
        <LoadingBar {...loadingBar} />
      </div>

      <DoneButton {...buttonsProps.DONE} />
    </div>
  );
};

const DoneButton = (buttonProps: ToolbarButtonProps) => {
  const {
    className: customButtonClassNames,
    disabled,
    active,
    hidden,
    onClick,
    ...restButtonProps
  } = buttonProps;

  return (
    <Tooltip tip="Click to Complete Extraction">
      <Button
        className="text-nowrap p-4"
        icon={faScalpel}
        disabled={disabled}
        {...restButtonProps}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          if (onClick) {
            onClick(e);
          }
        }}
        {...restButtonProps}
      >
        Done
      </Button>
    </Tooltip>
  );
};
