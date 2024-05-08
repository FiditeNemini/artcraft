import { MediaFileType } from "@storyteller/components/src/api/_common/enums/MediaFileType";

// THESE SHOULD BECOME A TRANSLATION STRINGS -- REPLACE LATER
export const mediaTypeLabels = {
  [MediaFileType.Audio]: "Audio",
  [MediaFileType.Video]: "Video",
  [MediaFileType.Image]: "Image",
  [MediaFileType.BVH]: "BVH",
  [MediaFileType.GLB]: "GLB",
  [MediaFileType.GLTF]: "glTF",
  [MediaFileType.SceneRon]: "RON",
  [MediaFileType.SceneJson]: "Scene",
  [MediaFileType.FBX]: "FBX",
  [MediaFileType.None]: "Unknown",
};
