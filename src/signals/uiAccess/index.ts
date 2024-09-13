import { ContextualLoadingBarProps } from "./type";

type uiAccessType = {
  loadingBar: ContextualLoadingBarProps;
};

export type { uiAccessType };

import { buttonRetry } from "./buttonRetry";
import { buttonTest } from "./buttonTest";
import { dialogueError } from "./dialogueError";
import { loadingBar } from "./loadingBar";
import { toolbarImage } from "./toolbarImage";
import { toolbarVideo } from "./toolbarVideo";
import { toolbarMain } from "./toolbarMain";

export const uiAccess = {
  buttonRetry,
  buttonTest,
  dialogueError,
  toolbarImage,
  loadingBar,
  toolbarVideo,
  toolbarMain,
};
