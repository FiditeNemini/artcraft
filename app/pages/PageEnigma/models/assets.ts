export interface MediaItem {
  version: number;
  type: AssetType;
  media_id: string;
  object_uuid?: string;
  name: string;
  description?: string;
  publicBucketPath?: string;
  length?: number;
  thumbnail?: string;
  isMine?: boolean;
  isBookmarked?: boolean;
  imageIndex?: number;
}

export enum AssetType {
  ANIMATION = "animation",
  AUDIO = "audio",
  CAMERA = "camera",
  CHARACTER = "character",
  EXPRESSION = "expression",
  OBJECT = "object",
  SHAPE = "shape",
  STYLE = "style", // TODO Remove
}

export enum AssetFilterOption {
  ALL,
  MINE,
  BOOKMARKED,
}
