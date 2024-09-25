import { ContextualLoadingBarProps } from "./type";

type uiAccessType = {
  loadingBar: ContextualLoadingBarProps;
};

export type { uiAccessType };

import { buttonRetry } from "./buttonRetry";
import { buttonTest } from "./buttonTest";
import { dialogueError } from "./dialogueError";
import { loadingBar } from "./loadingBar";
import { toolbarMain } from "./toolbarMain";
import { toolbarNode } from "./toolbarNode";

export const uiAccess = {
  buttonRetry,
  buttonTest,
  dialogueError,
  loadingBar,
  toolbarMain,
  toolbarNode,
};
