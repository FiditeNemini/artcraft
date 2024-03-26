import { createContext } from "react";
import { AnimationClip, AudioClip } from "~/models/track";

export const ClipContext = createContext<{
  animationClips: AnimationClip[];
  audioClips: AudioClip[];
  dragType: "animations" | "lipSync" | null;
  dragId: string | null;
  startDrag: (type: "animations" | "lipSync", id: string) => void;
  endDrag: () => void;
  scale: number;
  currentTime: number;
  length: number;
  updateCurrentTime: (time: number) => void;
  canDrop: boolean;
  setCanDrop: (can: boolean) => void;
}>({
  animationClips: [],
  audioClips: [],
  dragType: null,
  dragId: null,
  startDrag: () => {},
  endDrag: () => {},
  scale: 1,
  currentTime: 0,
  length: 12,
  updateCurrentTime: () => {},
  canDrop: false,
  setCanDrop: () => {},
});
