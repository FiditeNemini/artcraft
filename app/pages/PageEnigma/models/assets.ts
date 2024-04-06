import { ClipType } from "~/pages/PageEnigma/models";

export interface MediaItem {
  version: number;
  type: AssetType;
  media_id: string;
  name: string;
  length?: number;
  thumbnail: string;
}

export enum AssetType {
  CHARACTER = "character",
  OBJECT = "object",
  AUDIO = "audio",
  ANIMATION = "animation",
  CAMERA = "camera",
}
