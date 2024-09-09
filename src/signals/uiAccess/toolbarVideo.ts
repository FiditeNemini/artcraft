import { signal } from "@preact/signals-core";
import { ContextualUi } from "./type";
import { ToolbarVideoButtonNames } from "~/components/features/ToolbarVideo/enums";

interface ContextualVideoToolbarProps extends ContextualUi {
  disabled: boolean;
  buttonStates: {
    [key in ToolbarVideoButtonNames]: {
      disabled: boolean;
      active: boolean;
    };
  };
}

const toolbarVideoSignal = signal<ContextualVideoToolbarProps>({
  position: {
    x: 0,
    y: 0,
  },
  isShowing: false,
  disabled: false,
  buttonStates: initButtonStates(),
});

export const toolbarVideo = {
  signal: toolbarVideoSignal,
  setup(props: ContextualVideoToolbarProps) {
    toolbarVideoSignal.value = props;
  },
  update(props: Partial<ContextualVideoToolbarProps>) {
    toolbarVideoSignal.value = {
      ...toolbarVideoSignal.value,
      ...props,
    };
  },
  setPosition(position: ContextualVideoToolbarProps["position"]) {
    toolbarVideoSignal.value = {
      ...toolbarVideoSignal.value,
      position,
    };
  },
  show() {
    toolbarVideoSignal.value = {
      ...toolbarVideoSignal.value,
      isShowing: true,
    };
  },
  hide() {
    toolbarVideoSignal.value = {
      ...toolbarVideoSignal.value,
      isShowing: false,
    };
  },
  enable() {
    toolbarVideoSignal.value = {
      ...toolbarVideoSignal.value,
      disabled: false,
    };
  },
  disable() {
    toolbarVideoSignal.value = {
      ...toolbarVideoSignal.value,
      disabled: true,
    };
  },
  changeButtonState(
    buttonName: ToolbarVideoButtonNames,
    { disabled, active }: { disabled?: boolean; active?: boolean },
  ) {
    toolbarVideoSignal.value = {
      ...toolbarVideoSignal.value,
      buttonStates: {
        ...toolbarVideoSignal.value.buttonStates,
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
  Object.values(ToolbarVideoButtonNames).forEach((buttonName) => {
    ret[buttonName] = {
      disabled: false,
      active: false,
    };
  });
  return ret as ContextualVideoToolbarProps["buttonStates"];
}
