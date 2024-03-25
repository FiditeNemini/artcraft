import { createContext } from "react";
import {
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
  scale: number;
  currentTime: number;
  length: number;
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
  updateCurrentTime: (time: number) => void;
  toggleLipSyncMute: (characterId: string) => void;
  toggleAudioMute: () => void;
}>({
  characters: [],
  camera: null,
  audio: null,
  objects: { id: "", objects: [] },
  selectedClip: null,
  scale: 1,
  currentTime: 0,
  length: 12,
  updateCharacters: () => {},
  updateCamera: () => {},
  updateAudio: () => {},
  updateObject: () => {},
  selectClip: () => {},
  updateCurrentTime: () => {},
  toggleLipSyncMute: () => {},
  toggleAudioMute: () => {},
});
