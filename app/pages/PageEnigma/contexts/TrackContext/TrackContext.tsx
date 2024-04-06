import { createContext } from "react";
import { MediaItem, Keyframe, QueueKeyframe } from "~/pages/PageEnigma/models";

export const TrackContext = createContext<{
  // keyframes
  addKeyframe: (keyframe: QueueKeyframe, offset: number) => void;
  deleteKeyframe: (keyframe: Keyframe) => void;

  // sidebar clips
  animationClips: MediaItem[];
  audioClips: MediaItem[];
  characterItems: MediaItem[];
  objectItems: MediaItem[];

  // drag and drop
  startDrag: (item: MediaItem) => void;
  endDrag: () => void;
}>({
  addKeyframe: () => {},
  deleteKeyframe: () => {},

  animationClips: [],
  audioClips: [],
  characterItems: [],
  objectItems: [],

  startDrag: () => {},
  endDrag: () => {},
});
