import { LoadingBarProps } from "~/components/ui";

export interface ContextualUi {
  position: {
    x: number;
    y: number;
  };
  isShowing: boolean;
}

export interface ContextualLoadingBarProps
  extends ContextualUi,
    Omit<LoadingBarProps, "position"> {
  width: number;
}

export interface ContextualButtonRetryProps extends ContextualUi {
  disabled: boolean;
}
