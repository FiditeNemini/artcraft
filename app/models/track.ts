import {Base} from "postcss-selector-parser";

export interface BaseClip {
  id: string;
  name: string;
  offset: number;
  length: number;
  selected: boolean;
}

export interface AnimationClip extends BaseClip {}

export interface PositionClip extends BaseClip {}

export interface LipSyncClip extends BaseClip {}

export interface CharacterTrack {
  id: string;
  animationClips: AnimationClip[];
  positionClips: PositionClip[];
  lipSyncClips: LipSyncClip[];
}

export interface CameraTrack {
  id: string;
  clips: CameraClip[];
}

export interface CameraClip extends BaseClip {}
