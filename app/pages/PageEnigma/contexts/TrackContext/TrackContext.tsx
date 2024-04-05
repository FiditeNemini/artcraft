import { createContext } from "react";
import {
  MediaClip,
  Keyframe,
  QueueKeyframe,
  ClipType,
  ObjectItem,
  AssetType,
} from "~/pages/PageEnigma/models";

export const TrackContext = createContext<{
  // keyframes
  addKeyframe: (keyframe: QueueKeyframe, offset: number) => void;
  deleteKeyframe: (keyframe: Keyframe) => void;

  // sidebar clips
  animationClips: MediaClip[];
  audioClips: MediaClip[];
  characterItems: ObjectItem[];

  // drag and drop
  startDrag: (type: AssetType, id: string, length: number) => void;
  endDrag: () => void;
}>({
  addKeyframe: () => {},
  deleteKeyframe: () => {},

  animationClips: [],
  audioClips: [],
  characterItems: [],

  startDrag: () => {},
  endDrag: () => {},
});
