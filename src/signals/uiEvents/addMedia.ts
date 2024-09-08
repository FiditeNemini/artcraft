import { signal } from "@preact/signals-core";
import { effect } from "@preact/signals-react";

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

const stagedVideo = signal<File | null>(null);

const addVideoToEngine = (video: File) => {
  stagedVideo.value = video;
};

const onGetStagedVideo = (callback: (file: File) => void) => {
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
