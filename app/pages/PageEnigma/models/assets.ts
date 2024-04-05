import { ClipType } from "~/pages/PageEnigma/models";

export interface MediaClip {
  version: number;
  type: ClipType;
  media_id: string;
  name: string;
  length: number;
}

export interface ObjectItem {
  version: number;
  media_id: string;
  name: string;
  thumbnail: string;
}

export enum AssetType {
  CHARACTER = "character",
  OBJECT = "object",
  AUDIO = "audio",
  ANIMATION = "animation",
  CAMERA = "camera",
}
