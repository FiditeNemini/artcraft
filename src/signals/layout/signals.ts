import { computed, signal } from "@preact/signals-react";

export const windowWidth = signal(window.innerWidth);
export const windowHeight = signal(window.innerHeight);

export const isMobile = computed(() => {
  return windowWidth.value < 768 && windowWidth.value < windowHeight.value;
});
