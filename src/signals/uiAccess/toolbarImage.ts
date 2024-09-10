import { signal } from "@preact/signals-react";
import { ContextualUi } from "./type";
import { ToolbarImageButtonNames } from "~/components/features/ToolbarImage/enums";

interface ContextualImageToolbarProps extends ContextualUi {
  disabled: boolean;
  buttonStates: {
    [key in ToolbarImageButtonNames]: {
      disabled: boolean;
      active: boolean;
    };
  };
}

const toolbarImageSignal = signal<ContextualImageToolbarProps>({
  position: {
    x: 0,
    y: 0,
  },
  isShowing: false,
  disabled: false,
  buttonStates: initButtonStates(),
});

export const toolbarImage = {
  signal: toolbarImageSignal,
  setup(props: ContextualImageToolbarProps) {
    toolbarImageSignal.value = props;
  },
  update(props: Partial<ContextualImageToolbarProps>) {
    toolbarImageSignal.value = {
      ...toolbarImageSignal.value,
      ...props,
    };
  },
  setPosition(position: ContextualImageToolbarProps["position"]) {
    toolbarImageSignal.value = {
      ...toolbarImageSignal.value,
      position,
    };
  },
  show() {
    toolbarImageSignal.value = {
      ...toolbarImageSignal.value,
      isShowing: true,
    };
  },
  hide() {
    toolbarImageSignal.value = {
      ...toolbarImageSignal.value,
      isShowing: false,
    };
  },
  enable() {
    toolbarImageSignal.value = {
      ...toolbarImageSignal.value,
      disabled: false,
    };
  },
  disable() {
    toolbarImageSignal.value = {
      ...toolbarImageSignal.value,
      disabled: true,
    };
  },
  changeButtonState(
    buttonName: ToolbarImageButtonNames,
    { disabled, active }: { disabled?: boolean; active?: boolean },
  ) {
    toolbarImageSignal.value = {
      ...toolbarImageSignal.value,
      buttonStates: {
        ...toolbarImageSignal.value.buttonStates,
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
  Object.values(ToolbarImageButtonNames).forEach((buttonName) => {
    ret[buttonName] = {
      disabled: false,
      active: false,
    };
  });
  return ret as ContextualImageToolbarProps["buttonStates"];
}
