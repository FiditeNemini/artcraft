export interface MediaItem {
  colorIndex?: number;
  version: number;
  type: AssetType;
  media_id: string;
  object_uuid?: string;
  name: string;
  description?: string;
  publicBucketPath?: string;
  length?: number; // unit of length is frames, as in FPS
  thumbnail?: string;
  imageIndex?: number;
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
  STYLE = "style", // TODO Remove
}

export enum AssetFilterOption {
  ALL,
  MINE,
  BOOKMARKED,
}

export interface AudioMediaItem extends MediaItem {
  category?: string;
  isNew?: boolean;
}
