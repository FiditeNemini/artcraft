import { signal } from "@preact/signals-core";

export const loadingBarIsShowing = signal(true);
export const loadingBarData = signal<{
  label: string;
  message: string;
  progress: number;
  useFakeTimer: number;
}>({
  label: "",
  progress: 5,
  message: "Loading Editor Engine 🦊",
  useFakeTimer: 0,
});
