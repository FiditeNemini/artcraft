import { signal } from "@preact/signals-core";
import { MediaItem } from "~/pages/PageEnigma/models";

export const dragItem = signal<MediaItem | null>(null);
export const canDrop = signal(false);
export const overTimeline = signal(false);
export const dropId = signal("");
export const dropOffset = signal(0);

export const dndTimelineHeight = signal(-1);

export const initPosition = signal<{ initX: number; initY: number }>({
  initX: 0,
  initY: 0,
});
export const currPosition = signal<{ currX: number; currY: number }>({
  currX: 0,
  currY: 0,
});
