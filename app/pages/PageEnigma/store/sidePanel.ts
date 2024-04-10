import { computed, signal } from "@preact/signals-core";
import { AssetFilterOption, Tab } from "~/pages/PageEnigma/models";
import { timelineHeight } from "~/pages/PageEnigma/store/sizing";
import { pageHeight } from "~/store";

export const sidePanelVisible = signal(true);

export const dndSidePanelWidth = signal(-1);

export const selectedTab = signal<Tab | null>(null);
export const lastSelectedTab = signal<Tab | null>(null);

export const animationFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);
export const audioFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);
export const cameraFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);
export const characterFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);
export const objectFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);
export const shapeFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);

export const sidePanelHeight = computed(() => {
  return pageHeight.value - timelineHeight.value - 68; // header
});
