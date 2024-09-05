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

import { imageToolbar } from "./imageToolbar";
import { loadingBar } from "./loadingBar";
export const uiAccess = {
  imageToolbar,
  loadingBar,
};
