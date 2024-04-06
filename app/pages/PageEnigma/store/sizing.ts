import { signal, computed } from "@preact/signals-core";

export const pageHeight = signal(0);
export const pageWidth = signal(0);

// timeline
export const scale = signal(1);
export const filmLength = signal(12);
export const timelineHeight = signal(0);

export const fullWidth = computed(() => {
  return filmLength.value * 60 * 4 * scale.value;
});

// side panel
export const sidePanelWidth = signal(0);
