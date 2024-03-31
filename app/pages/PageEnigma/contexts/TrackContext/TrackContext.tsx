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
  // timeline characters and it's functions
  characters: CharacterGroup[];
  updateCharacters: (options: {
    type: "animations" | "positions" | "lipSync";
    id: string;
    length: number;
    offset: number;
  }) => void;
  toggleLipSyncMute: (characterId: string) => void;
  addCharacterAnimation: (options: {
    clipId: string;
    characterId: string;
    animationClips: MediaClip[];
    offset: number;
  }) => void;
  addCharacterAudio: (options: {
    clipId: string;
    characterId: string;
    audioClips: MediaClip[];
    offset: number;
  }) => void;
  selectCharacterClip: (clipId: string) => void;
  deleteCharacterClip: (clipId: string) => void;

  // timeline camera group
  camera: CameraGroup | null;
  updateCamera: (options: { id: string; offset: number }) => void;
  selectCameraKeyframe: (clipId: string) => void;

  // timeline global audio group
  audio: AudioGroup | null;
  updateAudio: (options: {
    id: string;
    length: number;
    offset: number;
  }) => void;
  toggleAudioMute: () => void;
  addGlobalAudio: (
    clipId: string,
    animationClips: MediaClip[],
    offset: number,
  ) => void;
  selectAudioClip: (clipId: string) => void;
  deleteAudioClip: (clipId: string) => void;

  // timeline objects group
  objects: ObjectGroup;
  updateObject: (options: { id: string; offset: number }) => void;

  // current - only select one item - will be replaced
  selectedItem: string | null;
  selectItem: (itemId: string) => void;

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
  characters: [],
  updateCharacters: () => {},
  toggleLipSyncMute: () => {},
  addCharacterAnimation: () => {},
  addCharacterAudio: () => {},
  selectCharacterClip: () => {},
  deleteCharacterClip: () => {},

  camera: null,
  updateCamera: () => {},
  selectCameraKeyframe: () => {},

  audio: null,
  updateAudio: () => {},
  toggleAudioMute: () => {},
  selectAudioClip: () => {},
  addGlobalAudio: () => {},
  deleteAudioClip: () => {},

  objects: { id: "", objects: [] },
  updateObject: () => {},

  addKeyframe: () => {},
  deleteKeyframe: () => {},

  selectedItem: null,
  selectItem: () => {},

  animationClips: [],
  audioClips: [],

  startDrag: () => {},
  endDrag: () => {},
});
