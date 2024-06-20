import { ArtStyle } from "~/enums";
import { CameraAspectRatio } from "../enums";

export interface SceneGenereationMetaData {
  artisticStyle: ArtStyle;
  positivePrompt: string;
  negativePrompt: string;

  cameraAspectRatio: CameraAspectRatio;
  adapterImageToken: string;

  upscale: boolean;
  faceDetail: boolean;
  styleStrength: number;
  lipSync: boolean;
  cinematic: boolean;
}
