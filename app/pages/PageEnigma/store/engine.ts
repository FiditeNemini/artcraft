import { signal } from "@preact/signals-core";

export enum EditorStates {
  EDIT,
  CAMERA_VIEW,
  PREVIEW,
}

export const engineState = signal<EditorStates>(EditorStates.EDIT);
