import { XYZ } from "../datastructures/common";

export interface QueueClip {
  version: number;
  type: ClipType;
  group: ClipGroup;
  object_uuid?: string;
  clip_uuid?: string;
  media_id?: string;
  name?: string;
  offset?: number;
  length?: number;
  selected?: boolean;
}

export interface MediaClip {
  version: number;
  type: ClipType;
  media_id: string;
  name: string;
  length: number;
}

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
}

export enum ClipGroup {
  CHARACTER = "character",
  CAMERA = "camera",
  GLOBAL_AUDIO = "global_audio",
  OBJECT = "object",
}

export interface KeyFrame {
  version: number;
  keyframe_uuid: string;
  group: ClipGroup;
  object_uuid?: string;
  offset: number;
  position: XYZ;
  rotation: XYZ;
  scale: XYZ;
  selected?: boolean;
}

export interface CharacterGroup {
  id: string;
  muted: boolean;
  animationClips: Clip[];
  positionKeyframes: KeyFrame[];
  lipSyncClips: Clip[];
}

export interface CameraGroup {
  id: string;
  clips: KeyFrame[];
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
  id: string;
  keyFrames: KeyFrame[];
}
