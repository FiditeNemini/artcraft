import { signal, effect } from "@preact/signals-react";

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

const stagedVideo = signal<{ url: string } | null>(null);

const addVideoToEngine = (videoData: { url: string }) => {
  stagedVideo.value = videoData;
};

const onGetStagedVideo = (callback: (videoData: { url: string }) => void) => {
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
