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

export interface BaseKeyFrame {
  id: string;
  name: string;
  offset: number;
  selected?: boolean;
}

export interface CharacterGroup {
  id: string;
  muted: boolean;
  animationClips: Clip[];
  positionClips: Clip[];
  lipSyncClips: Clip[];
}

export interface CameraGroup {
  id: string;
  clips: Clip[];
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
  keyFrames: ObjectKeyFrame[];
}

export interface ObjectKeyFrame extends BaseKeyFrame {}
