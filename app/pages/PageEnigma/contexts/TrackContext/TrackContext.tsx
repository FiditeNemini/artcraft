import { createContext } from "react";
import {
  MediaClip,
  Keyframe,
  QueueKeyframe,
  Clip,
} from "~/pages/PageEnigma/models/track";

export const TrackContext = createContext<{
  // keyframes
  addKeyframe: (keyframe: QueueKeyframe, offset: number) => void;
  deleteKeyframe: (keyframe: Keyframe) => void;

  // current - only select one item - will be replaced
  selectedItem: Clip | Keyframe | null;
  selectItem: (item: Clip | Keyframe) => void;

  // sidebar clips
  animationClips: MediaClip[];
  audioClips: MediaClip[];

  // drag and drop
  startDrag: (
    type: "animations" | "lipSync",
    id: string,
    length: number,
  ) => void;
  endDrag: () => void;
}>({
  addKeyframe: () => {},
  deleteKeyframe: () => {},

  selectedItem: null,
  selectItem: () => {},

  animationClips: [],
  audioClips: [],

  startDrag: () => {},
  endDrag: () => {},
});
