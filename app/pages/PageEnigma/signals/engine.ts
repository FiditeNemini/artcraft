import { signal } from "@preact/signals-core";
import { EditorStates } from "~/pages/PageEnigma/enums";

export const editorState = signal<EditorStates>(EditorStates.EDIT);

export const previewSrc = signal("");
