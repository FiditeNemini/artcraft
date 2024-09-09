import { ContextualLoadingBarProps } from "./type";

type uiAccessType = {
  loadingBar: ContextualLoadingBarProps;
};

export type { uiAccessType };

import { errorDialogue } from "./errorDialogue";
import { toolbarImage as imageToolbar } from "./toolbarImage";
import { toolbarVideo } from "./toolbarVideo";
import { toolbarMain } from "./toolbarMain";
import { loadingBar } from "./loadingBar";

export const uiAccess = {
  errorDialogue,
  imageToolbar,
  loadingBar,
  toolbarVideo,
  toolbarMain,
};
