import { login, getSession, logout } from "~/api";
import { SessionResponse } from "./types";
import { AUTH_ERROR_FALLBACKS } from "~/enums";
import { authentication } from "./authentication";

export const CreateSession = ({
  usernameOrEmail,
  password,
}: {
  usernameOrEmail: string;
  password: string;
}) => {
  const request = {
    username_or_email: usernameOrEmail,
    password: password,
  };

  return fetch(login, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    // credentials: 'include',
    body: JSON.stringify(request),
  })
    .then((res) => res.json())
    .then((res) => {
      return res;
    })
    .catch((e: ErrorEvent) => {
      return {
        success: false,
        error_reason: e.message || AUTH_ERROR_FALLBACKS.CreateSessionError,
      };
    });
};

export const GetSession = () => {
  if (authentication.sessionToken.value) {
    return fetch(getSession, {
      method: "GET",
      headers: {
        Accept: "application/json",
        session: authentication.sessionToken.value,
      },
      // credentials: 'include',
    })
      .then((res) => res.json())
      .then((res) => {
        const response: SessionResponse = res;
        return response;
      })
      .catch((e: ErrorEvent) => {
        return {
          success: false,
          error_reason: e.message || AUTH_ERROR_FALLBACKS.GetSessionError,
        };
      });
  }
  // fallback incase auth values doesnot exist
  return new Promise<SessionResponse>((resolve) => {
    resolve({
      success: false,
      error_reason: AUTH_ERROR_FALLBACKS.Unauthorized,
    });
  });
};

export function DestroySession(): Promise<SessionResponse> {
  if (authentication.sessionToken.value) {
    return fetch(logout, {
      method: "POST",
      headers: {
        Accept: "application/json",
        session: authentication.sessionToken.value || "",
      },
      // credentials: 'include',
    })
      .then((res) => res.json())
      .then((res) => {
        const response: SessionResponse = res;
        return response;
      })
      .catch((e: ErrorEvent) => {
        return {
          success: false,
          error_reason: e.message || AUTH_ERROR_FALLBACKS.DestorySessionError,
        };
      });
  }
  // fallback incase auth values doesnot exist
  return new Promise<SessionResponse>((resolve) => {
    resolve({
      success: false,
      error_reason: AUTH_ERROR_FALLBACKS.Unauthorized,
    });
  });
}
