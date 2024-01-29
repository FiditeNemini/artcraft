import { MediaFileType } from "@storyteller/components/src/api/_common/enums/MediaFileType";

type MediaFileTypeInfo = {
  [key in MediaFileType]: { label: string; color: string };
};

const mediaFileTypeInfo: MediaFileTypeInfo = {
  [MediaFileType.Audio]: {
    label: "Audio",
    color: "teal",
  },
  [MediaFileType.Image]: {
    label: "Image",
    color: "ultramarine",
  },
  [MediaFileType.Video]: {
    label: "Video",
    color: "purple",
  },
  [MediaFileType.BVH]: {
    label: "BVH",
    color: "pink",
  },
  [MediaFileType.GLTF]: {
    label: "glTF",
    color: "lime",
  },
  [MediaFileType.FBX]: {
    label: "FBX",
    color: "turquoise",
  },
  [MediaFileType.None]: {
    label: "None",
    color: "gray",
  },
};

export default function useMediaFileTypeInfo(mediaFileType: MediaFileType) {
  return (
    mediaFileTypeInfo[mediaFileType] || {
      label: "None",
      color: "gray",
    }
  );
}
