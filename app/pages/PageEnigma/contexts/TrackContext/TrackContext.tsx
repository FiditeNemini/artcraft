import { createContext } from "react";
import {
  AnimationClip,
  AudioClip,
  AudioGroup,
  CameraGroup,
  CharacterGroup,
  ObjectGroup,
} from "~/models/track";

export const TrackContext = createContext<{
  characters: CharacterGroup[];
  camera: CameraGroup | null;
  audio: AudioGroup | null;
  objects: ObjectGroup;
  selectedClip: string | null;
  updateCharacters: (options: {
    type: "animations" | "positions" | "lipSync";
    id: string;
    length: number;
    offset: number;
  }) => void;
  updateCamera: (options: {
    id: string;
    length: number;
    offset: number;
  }) => void;
  updateAudio: (options: {
    id: string;
    length: number;
    offset: number;
  }) => void;
  updateObject: (options: {
    id: string;
    length: number;
    offset: number;
  }) => void;
  selectClip: (clipId: string) => void;
  toggleLipSyncMute: (characterId: string) => void;
  toggleAudioMute: () => void;
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
  fullWidth: number;
}>({
  characters: [],
  camera: null,
  audio: null,
  objects: { id: "", objects: [] },
  selectedClip: null,
  updateCharacters: () => {},
  updateCamera: () => {},
  updateAudio: () => {},
  updateObject: () => {},
  selectClip: () => {},
  toggleLipSyncMute: () => {},
  toggleAudioMute: () => {},
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
  fullWidth: 0,
});
