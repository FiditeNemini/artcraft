import { authentication } from "./authentication";
import { UserInfo, SessionResponse } from "./types";
import { CreateSession, GetSession, DestroySession } from "./fetchers";
import { AUTH_STATUS, STORAGE_KEYS } from "~/enums";

export const updateAuthStatus = (newStatus: AUTH_STATUS) => {
  authentication.status.value = newStatus;
};
export const updateSessionToken = (newToken: string | undefined) => {
  authentication.sessionToken.value = newToken;
  if (newToken) {
    localStorage.setItem(STORAGE_KEYS.SESSION_TOKEN, newToken);
  } else {
    localStorage.removeItem(STORAGE_KEYS.SESSION_TOKEN);
  }
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

const setLogoutStates = () => {
  updateAuthStatus(AUTH_STATUS.LOGGED_OUT);
  updateUserInfo(undefined);
  updateSessionToken(undefined);
};

export const login = ({
  usernameOrEmail,
  password,
  failureCallback,
}: {
  usernameOrEmail: string;
  password: string;
  failureCallback?: () => void;
}) => {
  // console.info("CreateSession");
  updateAuthStatus(AUTH_STATUS.LOGGING);
  CreateSession({ usernameOrEmail, password }).then((loginResponse) => {
    updateSessionToken(loginResponse.signed_session);
    GetSession().then((sessionResponse: SessionResponse) => {
      if (sessionResponse.success && sessionResponse.user) {
        updateAuthStatus(AUTH_STATUS.LOGGED_IN);
        updateUserInfo(sessionResponse.user);
        return;
      }
      if (failureCallback) {
        failureCallback();
      }
      setLogoutStates();
    });
  });
};

export const persistLogin = () => {
  //Only run First Load, return if not
  if (authentication.status.value !== AUTH_STATUS.INIT) {
    return;
  }
  //Persist Login if Session Data exist
  const sessionToken = localStorage.getItem(STORAGE_KEYS.SESSION_TOKEN);
  if (sessionToken === null) {
    // case of no existing session
    setLogoutStates();
    return;
  }
  // console.log('Getting session to persist login');
  updateSessionToken(sessionToken);
  updateAuthStatus(AUTH_STATUS.LOGGING);
  GetSession().then((sessionResponse: SessionResponse) => {
    // console.log(sessionResponse, 'Session Returned');
    if (sessionResponse.success && sessionResponse.user) {
      // console.log('Setting Auth State');
      updateAuthStatus(AUTH_STATUS.LOGGED_IN);
      updateUserInfo(sessionResponse.user, true);
      return;
    }
    // console.log('Session expired, setting State');
    setLogoutStates();
  });
};

export const logout = (failureCallback?: (errorMessage: string) => void) => {
  DestroySession().then((res) => {
    if (!res.success && failureCallback) {
      failureCallback(
        res.error_reason || "Unknown Error during Destroy Session",
      );
    }
    // if success, nothing
    // regarldess of success/fail, clear the state and localstorage
    setLogoutStates();
  });
};
