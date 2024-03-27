import { createContext } from "react";
import {
  AnimationClip,
  AudioClip,
  AudioGroup,
  BaseClip,
  CameraGroup,
  CharacterGroup,
  ObjectGroup,
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

  // timeline camera group
  camera: CameraGroup | null;
  updateCamera: (options: {
    id: string;
    length: number;
    offset: number;
  }) => void;
  selectCameraClip: (clipId: string) => void;

  // timeline global audio group
  audio: AudioGroup | null;
  updateAudio: (options: {
    id: string;
    length: number;
    offset: number;
  }) => void;
  toggleAudioMute: () => void;
  addGlobalAudio: (clipId: string, animationClips: BaseClip[]) => void;
  selectAudioClip: (clipId: string) => void;

  // timeline objects group
  objects: ObjectGroup;
  updateObject: (options: {
    id: string;
    length: number;
    offset: number;
  }) => void;
  selectObjectClip: (clipId: string) => void;

  // current - only select one item - will be replaced
  selectedClip: string | null;
  selectClip: (clipId: string) => void;

  // sidebar clips
  animationClips: AnimationClip[];
  audioClips: AudioClip[];

  // drag and drop
  dragType: "animations" | "lipSync" | null;
  dragId: string | null;
  startDrag: (type: "animations" | "lipSync", id: string) => void;
  endDrag: () => void;
  canDrop: boolean;
  setCanDrop: (can: boolean) => void;
  overTimeline: boolean;
  setOverTimeline: (over: boolean) => void;
  dropId: string;
  setDropId: (id: string) => void;
  dropOffset: number;
  setDropOffset: (offset: number) => void;

  // scale of timeline displa
  scale: number;

  // current time position
  currentTime: number;
  updateCurrentTime: (time: number) => void;

  // total length of the film clip
  length: number;

  // computed width length * 60 * 4 * scale
  fullWidth: number;
}>({
  characters: [],
  updateCharacters: () => {},
  toggleLipSyncMute: () => {},
  addCharacterAnimation: () => {},
  addCharacterAudio: () => {},
  selectCharacterClip: () => {},

  camera: null,
  updateCamera: () => {},
  selectCameraClip: () => {},

  audio: null,
  updateAudio: () => {},
  toggleAudioMute: () => {},
  selectAudioClip: () => {},
  addGlobalAudio: () => {},

  objects: { id: "", objects: [] },
  updateObject: () => {},
  selectObjectClip: () => {},

  selectedClip: null,
  selectClip: () => {},

  animationClips: [],
  audioClips: [],

  dragType: null,
  dragId: null,
  startDrag: () => {},
  endDrag: () => {},
  dropId: "",
  setDropId: () => {},
  canDrop: false,
  setCanDrop: () => {},
  overTimeline: false,
  setOverTimeline: () => {},
  dropOffset: 0,
  setDropOffset: () => {},

  scale: 1,
  currentTime: 0,
  updateCurrentTime: () => {},
  length: 12,
  fullWidth: 0,
});
