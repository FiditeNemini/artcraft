import { signal, effect } from "@preact/signals-react";
import { TextNodeData } from "~/KonvaApp/types";

// ADDING IMAGES
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

// ADDING VIDEOS
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

// ADD and EDIT TEXT
const stagedText = signal<TextNodeData | null>(null);
const addTextToEngine = (data: TextNodeData) => {
  stagedText.value = data;
};
const onAddTextToEngine = (callback: (data: TextNodeData) => void) => {
  effect(() => {
    if (stagedText.value) {
      callback(stagedText.value);
    }
  });
};

//EXPORTS
export const dispatchers = {
  addImageToEngine,
  addVideoToEngine,
  addTextToEngine,
};

export const events = {
  onGetStagedImage,
  onGetStagedVideo,
  onAddTextToEngine,
};
