export interface BaseClip {
  id: string;
  name: string;
  offset: number;
  length: number;
}

export interface AnimationClip extends BaseClip {}

export interface PositionClip extends BaseClip {}

export interface LipSyncClip extends BaseClip {}

export interface CharacterGroup {
  id: string;
  muted: boolean;
  animationClips: AnimationClip[];
  positionClips: PositionClip[];
  lipSyncClips: LipSyncClip[];
}

export interface CameraGroup {
  id: string;
  clips: CameraClip[];
}

export interface CameraClip extends BaseClip {}

export interface AudioGroup {
  id: string;
  muted: boolean;
  clips: AudioClip[];
}

export interface AudioClip extends BaseClip {}

export interface ObjectGroup {
  id: string;
  objects: ObjectTrack[];
}

export interface ObjectTrack {
  id: string;
  clips: ObjectClip[];
}

export interface ObjectClip extends BaseClip {}
