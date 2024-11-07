import { signal } from "@preact/signals-react";
import { ButtonState, LoadingBarState } from "./type";
import { ToolbarVideoExtractionButtonNames as ButtonNames } from "~/components/features/ToolbarVideoExtraction/enums";
import { VideoExtractionEvents } from "~/KonvaApp/types/events";

type ButtonStates = {
  [key in ButtonNames]: ButtonState;
};

export interface ToolbarVideoExtractionProps {
  isShowing: boolean;
  disabled: boolean;
  buttonStates: ButtonStates;
  loadingBarState: LoadingBarState;
}

const toolbarVideoExtractionSignal = signal<ToolbarVideoExtractionProps>({
  isShowing: false,
  disabled: false,
  buttonStates: initButtonStates(),
  loadingBarState: {
    progress: 0,
    status: VideoExtractionEvents.SESSION_CLOSED,
    message: undefined,
  },
});

export const toolbarVideoExtraction = {
  signal: toolbarVideoExtractionSignal,
  update(updateProps: Partial<ToolbarVideoExtractionProps>) {
    toolbarVideoExtractionSignal.value = {
      ...toolbarVideoExtractionSignal.value,
      ...updateProps,
    };
  },
  updateProgress(newLoadingBarState: LoadingBarState) {
    toolbarVideoExtractionSignal.value = {
      ...toolbarVideoExtractionSignal.value,
      loadingBarState: {
        ...toolbarVideoExtractionSignal.value.loadingBarState,
        ...newLoadingBarState,
      },
    };
  },
  show() {
    toolbarVideoExtractionSignal.value = {
      ...toolbarVideoExtractionSignal.value,
      isShowing: true,
    };
  },
  hide() {
    toolbarVideoExtractionSignal.value = {
      ...toolbarVideoExtractionSignal.value,
      isShowing: true,
    };
  },
  enable() {
    toolbarVideoExtractionSignal.value = {
      ...toolbarVideoExtractionSignal.value,
      disabled: false,
    };
  },
  disable() {
    toolbarVideoExtractionSignal.value = {
      ...toolbarVideoExtractionSignal.value,
      disabled: true,
    };
  },
};

function initButtonStates() {
  return Object.values(ButtonNames).reduce((buttonStates, buttonName) => {
    buttonStates[buttonName] = {
      disabled: false,
      hidden: false,
      active: false,
    };
    return buttonStates;
  }, {} as ButtonStates);
}
