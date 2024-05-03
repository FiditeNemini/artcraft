import { XYZ } from "../datastructures/common";

export interface Clip {
  version: number;
  clip_uuid: string;
  type: ClipType;
  group: ClipGroup;
  media_id: string;
  object_uuid?: string;
  name: string;
  offset: number;
  length: number;
  selected?: boolean;
}

export enum ClipType {
  TRANSFORM = "transform",
  AUDIO = "audio",
  ANIMATION = "animation",
  EXPRESSION = "expression",
  FAKE = "fake",
}

export enum ClipGroup {
  CHARACTER = "character",
  CAMERA = "camera",
  GLOBAL_AUDIO = "global_audio",
  OBJECT = "object",
}

export interface Keyframe {
  version: number;
  keyframe_uuid: string;
  group: ClipGroup;
  object_uuid: string;
  offset: number;
  position: XYZ;
  rotation: XYZ;
  scale: XYZ;
  selected?: boolean;
}

export interface CharacterGroup {
  id: string;
  characters: CharacterTrack[];
}

export interface CharacterTrack {
  object_uuid: string;
  media_id: string;
  name: string;
  muted: boolean;
  minimized: boolean;
  animationClips: Clip[];
  positionKeyframes: Keyframe[];
  expressionClips: Clip[];
  lipSyncClips: Clip[];
}

export interface CameraGroup {
  id: string;
  keyframes: Keyframe[];
}

export interface AudioGroup {
  id: string;
  muted: boolean;
  clips: Clip[];
}

export interface ObjectGroup {
  id: string;
  objects: ObjectTrack[];
}

export interface ObjectTrack {
  object_uuid: string;
  name: string;
  keyframes: Keyframe[];
}

export interface UpdateTime {
  currentTime: number;
}
