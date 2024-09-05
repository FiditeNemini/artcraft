import { signal } from "@preact/signals-core";
import { ContextualImageToolbarProps } from "./type";
import { ToolbarImageButtonNames } from "~/components/features/ToolbarImage/enums";

const imageToolbarSignal = signal<ContextualImageToolbarProps>({
  position: {
    x: 0,
    y: 0,
  },
  isShowing: false,
  disabled: false,
  buttonStates: initButtonStates(),
});

export const imageToolbar = {
  signal: imageToolbarSignal,
  setPosition(position: ContextualImageToolbarProps["position"]) {
    imageToolbarSignal.value = {
      ...imageToolbarSignal.value,
      position,
      isShowing: true,
    };
  },
  show() {
    imageToolbarSignal.value = {
      ...imageToolbarSignal.value,
      isShowing: true,
    };
  },
  hide() {
    imageToolbarSignal.value = {
      ...imageToolbarSignal.value,
      isShowing: false,
    };
  },
  enable() {
    imageToolbarSignal.value = {
      ...imageToolbarSignal.value,
      disabled: false,
    };
  },
  disable() {
    imageToolbarSignal.value = {
      ...imageToolbarSignal.value,
      disabled: true,
    };
  },
  changeButtonState(buttonName: ToolbarImageButtonNames, disabled: boolean) {
    imageToolbarSignal.value = {
      ...imageToolbarSignal.value,
      buttonStates: {
        ...imageToolbarSignal.value.buttonStates,
        [buttonName]: { disabled },
      },
    };
  },
};

function initButtonStates() {
  const ret: { [key: string]: { disabled: boolean } } = {};
  Object.values(ToolbarImageButtonNames).forEach((buttonName) => {
    ret[buttonName] = {
      disabled: false,
    };
  });
  return ret as ContextualImageToolbarProps["buttonStates"];
}
