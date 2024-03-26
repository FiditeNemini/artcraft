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
});
