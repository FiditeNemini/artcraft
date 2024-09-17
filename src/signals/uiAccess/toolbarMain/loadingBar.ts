import { signal } from "@preact/signals-react";
import { LoadingBarStatus } from "~/components/ui";

interface LoadingParInterface {
  isShowing: boolean;
  progress: number;
  status: LoadingBarStatus;
  message?: string;
}

const loadingBarSignal = signal<LoadingParInterface>({
  isShowing: false,
  progress: 0,
  status: LoadingBarStatus.IDLE,
  message: undefined,
});

export const loadingBar = {
  signal: loadingBarSignal,
  update: (props: Omit<LoadingParInterface, "isShowing">) => {
    loadingBarSignal.value = { ...loadingBarSignal.value, ...props };
  },
  updateMessage(message: string | undefined) {
    loadingBarSignal.value = {
      ...loadingBarSignal.value,
      message,
    };
  },
  updateProgress(progress: number) {
    loadingBarSignal.value = {
      ...loadingBarSignal.value,
      progress,
    };
  },
  updateStatus(status: LoadingBarStatus) {
    loadingBarSignal.value = {
      ...loadingBarSignal.value,
      status,
    };
  },
  show: (props?: Omit<LoadingParInterface, "isShowing">) => {
    const mergedProps = props
      ? { ...props, ...loadingBarSignal.value }
      : loadingBarSignal.value;
    loadingBarSignal.value = {
      ...mergedProps,
      isShowing: true,
    };
  },
  hide: () => {
    loadingBarSignal.value = { ...loadingBarSignal.value, isShowing: false };
  },
};
