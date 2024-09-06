import { MouseEventHandler } from "react";
import { ToolbarImageButtonNames } from "~/components/features/ToolbarImage/enums";
import { LoadingBarProps } from "~/components/ui";

export interface ContextualUi {
  position: {
    x: number;
    y: number;
  };
  isShowing: boolean;
}
export interface ContextualImageToolbarProps extends ContextualUi {
  disabled: boolean;
  buttonStates: {
    [key in ToolbarImageButtonNames]: {
      disabled: boolean;
    };
  };
  buttonCallbacks: {
    [key in ToolbarImageButtonNames]:
      | MouseEventHandler<HTMLButtonElement>
      | undefined;
  };
}

export interface ContextualLoadingBarProps
  extends ContextualUi,
    Omit<LoadingBarProps, "position"> {}
