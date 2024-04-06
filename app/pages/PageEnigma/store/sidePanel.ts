import { computed, signal } from "@preact/signals-core";
import { Tab } from "~/pages/PageEnigma/models";
import { pageHeight, timelineHeight } from "~/pages/PageEnigma/store/sizing";

export const dndWidth = signal(-1);

export const selectedTab = signal<Tab | null>(null);

export const sidePanelHeight = computed(() => {
  return pageHeight.value - timelineHeight.value - 68; // header
});
