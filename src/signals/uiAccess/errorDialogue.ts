import { signal } from "@preact/signals-react";

const initialState = {
  isShowing: false,
  title: "",
  message: "",
};
const errorDialogueSignal = signal(initialState);

export const errorDialogue = {
  signal: errorDialogueSignal,

  show({ title, message }: { title?: string; message?: string }) {
    errorDialogueSignal.value = {
      ...errorDialogueSignal.value,
      title: title ?? "Error",
      message: message ?? "An unknownerror occurred",
      isShowing: true,
    };
  },
  hide() {
    errorDialogueSignal.value = initialState;
  },
};
