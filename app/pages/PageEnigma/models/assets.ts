import { AssetType } from "~/enums";

export interface MediaItem {
  version: number;
  type: AssetType;
  media_type?: string;
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

export interface AudioMediaItem extends MediaItem {
  category?: string;
  isNew?: boolean;
}
