import { authentication } from "./authentication";

import { AUTH_STATUS } from "~/enums";
import { UserInfo, ActiveSubscriptions } from "~/models";

//TODO: DELETE THIS TOKEN HACK ASAP
export const updateSessionToken = (newToken: string | undefined) => {
  console.log("HACK // set session token >>", newToken);
  authentication.sessionToken.value = newToken;
};

export const updateAuthStatus = (newStatus: AUTH_STATUS) => {
  authentication.status.value = newStatus;
};

export const updateUserInfo = (
  newInfo: UserInfo | undefined,
  flush?: boolean,
) => {
  if (newInfo && !flush) {
    //case of updating UserInfo partly
    authentication.userInfo.value = {
      ...authentication.userInfo.value,
      ...newInfo,
    };
  } else {
    //case of setting a new User
    //case of deleting userInfo
    authentication.userInfo.value = newInfo;
  }
};
export const updateActiveSubscriptions = (
  activeSubs: ActiveSubscriptions | undefined,
) => {
  authentication.activeSubs.value = activeSubs;
};

// this function is not exposed, only the logout function is
export const setLogoutStates = () => {
  updateAuthStatus(AUTH_STATUS.LOGGED_OUT);
  updateUserInfo(undefined);
  updateActiveSubscriptions(undefined);
  //TODO: DELETE THIS TOKEN HACK ASAP
  updateSessionToken(undefined);
};
