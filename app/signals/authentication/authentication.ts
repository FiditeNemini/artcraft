import { signal } from "@preact/signals-core";
import { UserInfo } from "./types";
import { AUTH_STATUS } from "~/enums";

export const authentication = {
  status: signal<AUTH_STATUS>(AUTH_STATUS.INIT),
  sessionToken: signal<string | undefined>(undefined),
  userInfo: signal<UserInfo | undefined>(undefined),
};
