import { authentication } from "./authentication";
import { UsersApi } from "~/Classes/ApiManager/UsersApi";
import { BillingApi } from "~/Classes/ApiManager/BillingApi";

import {
  updateActiveSubscriptions,
  updateAuthStatus,
  updateSessionToken,
  updateUserInfo,
  setLogoutStates,
} from "./utilities";
import { AUTH_STATUS } from "~/enums";

export const logout = async (
  failureCallback?: (errorMessage: string) => void,
) => {
  const usersApi = new UsersApi();
  const logoutResponse = await usersApi.Logout();
  if (!logoutResponse.success && failureCallback) {
    failureCallback(
      logoutResponse.errorMessage || "Unknown Error during Destroy Session",
    );
  }
  // if success, nothing
  // regarldess of success/fail, clear the state and localstorage
  setLogoutStates();
};

export const login = async ({
  usernameOrEmail,
  password,
}: {
  usernameOrEmail: string;
  password: string;
  failureCallback?: () => void;
}) => {
  updateAuthStatus(AUTH_STATUS.LOGGING);

  const usersApi = new UsersApi();
  const loginResponse = await usersApi.Login({ usernameOrEmail, password });
  if (!loginResponse.success || !loginResponse.data) {
    setLogoutStates();
    return;
  }
  //TODO: DELETE THIS TOKEN HACK ASAP
  updateSessionToken(loginResponse.data.signedSession);

  // technically user is login with the system now, HOWEVER,
  // in storyteller studio, only having a sesison is not enough,
  // we need session info and active subscription info as well
  handleLoginPartTwo();
};

export const persistLogin = async () => {
  //Only run First Load, return if not
  if (authentication.status.value !== AUTH_STATUS.INIT) {
    return;
  }
  //Persist Login if Session Data exist
  const sessionCookie = await getSessionCookie();
  if (!sessionCookie) {
    // case of no existing session
    setLogoutStates();
    return;
  }

  //TODO: DELETE THIS TOKEN HACK ASAP
  updateSessionToken(sessionCookie);
  handleLoginPartTwo();
};

function getSessionCookie() {
  if (!document) {
    return undefined;
  }
  const cookies = document.cookie.split(";");
  const cookieKeyValue = cookies.find((cookie) => {
    return cookie.includes("session=");
  });
  if (!cookieKeyValue) {
    // no cookie
    return undefined;
  }
  const [, cookieValue] = cookieKeyValue.trim().split("=");
  return cookieValue;
}

async function handleLoginPartTwo() {
  console.log("parttwo");
  const usersApi = new UsersApi();
  const sessionResponse = await usersApi.GetSession();
  if (
    !sessionResponse.success ||
    !sessionResponse.data ||
    !sessionResponse.data.user
  ) {
    setLogoutStates();
    return;
  }

  const billingApi = new BillingApi();
  const subscriptionsResponse = await billingApi.ListActiveSubscriptions();
  if (
    !subscriptionsResponse.success ||
    !subscriptionsResponse.data ||
    !subscriptionsResponse.data.active_subscriptions
  ) {
    setLogoutStates();
    return;
  }

  updateUserInfo(sessionResponse.data.user);
  updateActiveSubscriptions({
    maybe_loyalty_program: subscriptionsResponse.data.maybe_loyalty_program,
    active_subscriptions: subscriptionsResponse.data.active_subscriptions || [],
  });
  updateAuthStatus(AUTH_STATUS.LOGGED_IN);
}
