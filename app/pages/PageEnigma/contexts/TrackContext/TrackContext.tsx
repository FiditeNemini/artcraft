import { createContext } from "react";
import {
  AudioGroup,
  CameraGroup,
  CharacterGroup,
  ObjectGroup,
  MediaClip,
  Keyframe,
  QueueKeyframe,
} from "~/pages/PageEnigma/models/track";

export const TrackContext = createContext<{
  // keyframes
  addKeyframe: (keyframe: QueueKeyframe, offset: number) => void;
  deleteKeyframe: (keyframe: Keyframe) => void;

  // current - only select one item - will be replaced
  selectedItem: string | null;
  selectItem: (itemId: string) => void;

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
