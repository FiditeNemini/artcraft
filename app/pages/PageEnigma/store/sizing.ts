import { signal, computed } from "@preact/signals-core";
import { characterGroups } from "~/pages/PageEnigma/store/characterGroups";
import { objectGroup } from "~/pages/PageEnigma/store/objectGroup";

export const scale = signal(1);
export const filmLength = signal(12);
export const timelineHeight = signal(0);
export const fullWidth = computed(() => {
  return filmLength.value * 60 * 4 * scale.value;
});

export const fullHeight = computed(() => {
  return (
    characterGroups.value.length * 268 +
    objectGroup.value.objects.length * 60 +
    300 +
    96
  );
});
