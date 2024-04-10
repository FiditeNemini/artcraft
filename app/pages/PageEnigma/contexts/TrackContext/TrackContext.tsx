import { createContext } from "react";
import { MediaItem, Keyframe, QueueKeyframe } from "~/pages/PageEnigma/models";

export const TrackContext = createContext<{
  // keyframes
  addKeyframe: (keyframe: QueueKeyframe, offset: number) => void;
  deleteKeyframe: (keyframe: Keyframe) => void;
  deleteObjectOrCharacter: (item: MediaItem) => void;

  // misc
  clearExistingData: () => void;

  // drag and drop
  startDrag: (item: MediaItem) => void;
  endDrag: () => void;
}>({
  addKeyframe: () => {},
  deleteKeyframe: () => {},
  deleteObjectOrCharacter: () => {},

  clearExistingData: () => {},

  startDrag: () => {},
  endDrag: () => {},
});
