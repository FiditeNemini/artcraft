export interface MediaItem {
  version: number;
  type: AssetType;
  media_id: string;
  name: string;
  length?: number;
  thumbnail: string;
  isMine?: boolean;
  isBookmarked?: boolean;
}

export enum AssetType {
  CHARACTER = "character",
  OBJECT = "object",
  AUDIO = "audio",
  ANIMATION = "animation",
  CAMERA = "camera",
  SHAPE = "shape",
  STYLE = "style"
}

export enum AssetFilterOption {
  ALL,
  MINE,
  BOOKMARKED,
}
