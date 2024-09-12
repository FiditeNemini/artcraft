import { ContextualLoadingBarProps } from "./type";

type uiAccessType = {
  loadingBar: ContextualLoadingBarProps;
};

export type { uiAccessType };

import { buttonTest } from "./buttonTest";

import { dialogueError } from "./dialogueError";
import { loadingBar } from "./loadingBar";
import { toolbarImage } from "./toolbarImage";
import { toolbarVideo } from "./toolbarVideo";
import { toolbarMain } from "./toolbarMain";

export const uiAccess = {
  buttonTest,
  dialogueError,
  toolbarImage,
  loadingBar,
  toolbarVideo,
  toolbarMain,
};
