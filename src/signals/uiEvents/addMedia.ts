import { signal, effect } from "@preact/signals-react";
import { TrimData } from "~/components/features/UploadVideo/TrimmerPlaybar";

const stagedImage = signal<File | null>(null);

const addImageToEngine = (image: File) => {
  stagedImage.value = image;
};

const onGetStagedImage = (callback: (file: File) => void) => {
  effect(() => {
    if (stagedImage.value) {
      callback(stagedImage.value);
    }
  });
};

const stagedVideo = signal<{ file: File; trimData?: TrimData } | null>(null);

const addVideoToEngine = (file: File, trimData?: TrimData) => {
  stagedVideo.value = { file, trimData };
};

const onGetStagedVideo = (
  callback: (videoData: {
    file: File;
    trimData?: { trimStartMs: number; trimEndMs: number };
  }) => void,
) => {
  effect(() => {
    if (stagedVideo.value) {
      callback(stagedVideo.value);
    }
  });
};

export const dispatchers = {
  addImageToEngine,
  addVideoToEngine,
};

export const events = {
  onGetStagedImage,
  onGetStagedVideo,
};
