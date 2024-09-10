import { ContextualLoadingBarProps } from "./type";

type uiAccessType = {
  loadingBar: ContextualLoadingBarProps;
};

export type { uiAccessType };

import { buttonTest } from "./buttonTest";

import { errorDialogue } from "./errorDialogue";
import { loadingBar } from "./loadingBar";
import { toolbarImage as imageToolbar } from "./toolbarImage";
import { toolbarVideo } from "./toolbarVideo";
import { toolbarMain } from "./toolbarMain";

export const uiAccess = {
  buttonTest,
  errorDialogue,
  imageToolbar,
  loadingBar,
  toolbarVideo,
  toolbarMain,
};
