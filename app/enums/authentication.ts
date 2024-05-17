export enum STORAGE_KEYS {
  SESSION_TOKEN = "session_token",
}

export enum AUTH_STATUS {
  INIT = "INIT",
  LOGGED_IN = "logged_in",
  LOGGING = "logging",
  LOGGED_OUT = "logged_out",
}

export enum AUTH_ERROR_FALLBACKS {
  CreateSessionError = "Unknown Error during Create Session",
  DestorySessionError = "Unknown Error during Destroy Session",
  GetSessionError = "Unknown Error During Get Session",
  Unauthorized = "User Unauthorized",
}
