import { signal } from "@preact/signals-core";

export type ContextualToolbar = {
  position: {
    x: number;
    y: number;
  };
  isShowing: boolean;
};

const imageToolbarSignal = signal<ContextualToolbar>({
  position: {
    x: 0,
    y: 0,
  },
  isShowing: false,
});

export const imageToolbar = {
  signal: imageToolbarSignal,
  setPosition(position: ContextualToolbar["position"]) {
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
