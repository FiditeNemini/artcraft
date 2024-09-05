import { signal } from "@preact/signals-core";

const stagedImage = signal<File | null>(null);

export const addImageToEngine = (image: File) => {
  stagedImage.value = image;
};

const getStagedImage = () => {
  return stagedImage.value;
};

export const uiEvents = {
  getStagedImage,
};
