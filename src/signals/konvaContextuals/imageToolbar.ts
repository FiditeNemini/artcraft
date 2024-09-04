import { signal } from "@preact/signals-core";
import { ContextualUi } from "./type";

const imageToolbarSignal = signal<ContextualUi>({
  position: {
    x: 0,
    y: 0,
  },
  isShowing: false,
});

export const imageToolbar = {
  signal: imageToolbarSignal,
  setPosition(position: ContextualUi["position"]) {
    imageToolbarSignal.value = {
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
};
