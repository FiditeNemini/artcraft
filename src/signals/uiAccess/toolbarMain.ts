import { signal } from "@preact/signals-react";
import { ToolbarMainButtonNames } from "~/components/features/ToolbarMain/enum";
import { LoadingBarStatus } from "~/components/ui";

interface LoadingParInterface {
  isShowing: boolean;
  progress: number;
  status: LoadingBarStatus;
  message?: string;
}

const loadingBarSignal = signal<LoadingParInterface>({
  isShowing: true,
  progress: 0,
  status: LoadingBarStatus.ERROR,
  message: undefined,
});

const loadingBar = {
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
  show: (props: Omit<LoadingParInterface, "isShowing">) => {
    loadingBarSignal.value = {
      ...loadingBarSignal.value,
      ...props,
      isShowing: true,
    };
  },
  hide: () => {
    loadingBarSignal.value = { ...loadingBarSignal.value, isShowing: false };
  },
};

interface ToolbarMainSignalInterface {
  disabled: boolean;
  buttonStates: {
    [key in ToolbarMainButtonNames]: { disabled: boolean; active: boolean };
  };
}
const toolbarMainSignal = signal<ToolbarMainSignalInterface>({
  disabled: false,
  buttonStates: initButtonStates(),
});

export const toolbarMain = {
  signal: toolbarMainSignal,
  loadingBar: loadingBar,
  changeButtonState(
    buttonName: ToolbarMainButtonNames,
    { disabled, active }: { disabled?: boolean; active?: boolean },
  ) {
    toolbarMainSignal.value = {
      ...toolbarMainSignal.value,
      buttonStates: {
        ...toolbarMainSignal.value.buttonStates,
        [buttonName]: {
          disabled: active ? false : (disabled ?? false),
          active: active ?? false,
        },
      },
    };
  },
};

function initButtonStates() {
  const ret: { [key: string]: { disabled: boolean; active: boolean } } = {};
  Object.values(ToolbarMainButtonNames).forEach((buttonName) => {
    ret[buttonName] = {
      disabled: false,
      active: false,
    };
  });
  return ret as ToolbarMainSignalInterface["buttonStates"];
}
