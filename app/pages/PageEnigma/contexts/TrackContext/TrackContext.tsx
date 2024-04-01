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

  animationClips: [],
  audioClips: [],

  startDrag: () => {},
  endDrag: () => {},
});
