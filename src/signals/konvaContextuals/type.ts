import { LoadingBarStatus } from "~/components/ui";
export { LoadingBarStatus };

export interface ContextualUi {
  position: {
    x: number;
    y: number;
  };
  isShowing: boolean;
}

export interface ContextualLoadingBarProps extends ContextualUi {
  progress: number;
  status: LoadingBarStatus;
  message?: string;
  onRetry?: () => void;
}
