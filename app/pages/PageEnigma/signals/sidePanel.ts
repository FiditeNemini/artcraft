import { computed, signal } from "@preact/signals-core";
import { Tab } from "~/pages/PageEnigma/models";
import { timelineHeight } from "~/pages/PageEnigma/signals/sizing";
import { pageHeight } from "~/signals";
import { AssetFilterOption } from "~/enums";

export const sidePanelVisible = signal(true);

export const dndSidePanelWidth = signal(-1);

export const selectedTab = signal<Tab | null>(null);
export const lastSelectedTab = signal<Tab | null>(null);

export const animationFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);
export const audioFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);
export const cameraFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);
export const characterFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);
export const expressionFilter = signal<AssetFilterOption>(
  AssetFilterOption.ALL,
);
export const objectFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);
export const shapeFilter = signal<AssetFilterOption>(AssetFilterOption.ALL);

export const sidePanelHeight = computed(() => {
  return pageHeight.value - timelineHeight.value - 68; // header
});
