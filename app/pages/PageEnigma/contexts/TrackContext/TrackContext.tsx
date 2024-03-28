import { createContext } from "react";
import {
  AnimationClip,
  AudioClip,
  AudioGroup,
  BaseClip,
  CameraGroup,
  CharacterGroup,
  ObjectGroup,
  ObjectTrack,
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
    animationClips: BaseClip[];
    offset: number;
  }) => void;
  addCharacterAudio: (options: {
    clipId: string;
    characterId: string;
    audioClips: BaseClip[];
    offset: number;
  }) => void;
  selectCharacterClip: (clipId: string) => void;
  deleteCharacterClip: (clipId: string) => void;

  // timeline camera group
  camera: CameraGroup | null;
  updateCamera: (options: {
    id: string;
    length: number;
    offset: number;
  }) => void;
  selectCameraClip: (clipId: string) => void;
  deleteCameraClip: (clipId: string) => void;

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
    animationClips: BaseClip[],
    offset: number,
  ) => void;
  selectAudioClip: (clipId: string) => void;
  deleteAudioClip: (clipId: string) => void;

  // timeline objects group
  objects: ObjectGroup;
  updateObject: (options: { id: string; offset: number }) => void;
  addObject: (options: ObjectTrack) => void;

  // current - only select one item - will be replaced
  selectedClip: string | null;
  selectClip: (clipId: string) => void;

  // sidebar clips
  animationClips: AnimationClip[];
  audioClips: AudioClip[];

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
  selectCameraClip: () => {},
  deleteCameraClip: () => {},

  audio: null,
  updateAudio: () => {},
  toggleAudioMute: () => {},
  selectAudioClip: () => {},
  addGlobalAudio: () => {},
  deleteAudioClip: () => {},

  objects: { id: "", objects: [] },
  updateObject: () => {},
  addObject: () => {},

  selectedClip: null,
  selectClip: () => {},

  animationClips: [],
  audioClips: [],

  startDrag: () => {},
  endDrag: () => {},
});
