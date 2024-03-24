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
