import {
  // ContextualUi,
  ContextualLoadingBarProps,
  ContextualImageToolbarProps,
} from "./type";

type uiAccessType = {
  imageToolbar: ContextualImageToolbarProps;
  loadingBar: ContextualLoadingBarProps;
};

export type { uiAccessType };

import { errorDialogue } from "./errorDialogue";
import { imageToolbar } from "./imageToolbar";
import { loadingBar } from "./loadingBar";

export const uiAccess = {
  errorDialogue,
  imageToolbar,
  loadingBar,
};
