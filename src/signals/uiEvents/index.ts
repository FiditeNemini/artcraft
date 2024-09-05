import { signal } from "@preact/signals-core";
import { effect } from "@preact/signals-react";
const stagedImage = signal<File | null>(null);

export const addImageToEngine = (image: File) => {
  stagedImage.value = image;
};

const onGetStagedImage = (callback: (file: File) => void) => {
  effect(() => {
    if (stagedImage.value) {
      callback(stagedImage.value);
    }
  });
};

export const uiEvents = {
  onGetStagedImage,
};
