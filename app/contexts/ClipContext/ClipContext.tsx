import { createContext } from "react";
import { AnimationClip, AudioClip } from "~/models/track";

export const ClipContext = createContext<{
  animationClips: AnimationClip[];
  audioClips: AudioClip[];
  dragType: "animation" | "audio" | null;
  dragId: string | null;
  startDrag: (type: "animation" | "audio", id: string) => void;
  endDrag: () => void;
}>({
  animationClips: [],
  audioClips: [],
  dragType: null,
  dragId: null,
  startDrag: () => {},
  endDrag: () => {},
});
