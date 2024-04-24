export enum STORAGE_KEYS{
  SESSION_TOKEN = "session_token",
}

export enum AUTH_STATUS {
  INIT = "INIT",
  LOGGED_IN = "logged_in",
  LOGGING = "logging",
  LOGGED_OUT = "logged_out",
}

export type AuthState = {
  authStatus: AUTH_STATUS;
  sessionToken?: string | null;
  userInfo?: UserInfo;
}
export interface UserInfo {
  user_token: string,
  username: string,
  display_name: string,
  email_gravatar_hash: string,

  // Rollout feature flags
  can_access_studio: boolean,
  maybe_feature_flags: string[],

  // Usage
  can_use_tts: boolean,
  can_use_w2l: boolean,
  can_delete_own_tts_results: boolean,
  can_delete_own_w2l_results: boolean,
  can_delete_own_account: boolean,

  // Contribution
  can_upload_tts_models: boolean,
  can_upload_w2l_templates: boolean,
  can_delete_own_tts_models: boolean,
  can_delete_own_w2l_templates: boolean,

  // Moderation
  can_approve_w2l_templates: boolean,
  can_edit_other_users_profiles: boolean,
  can_edit_other_users_tts_models: boolean,
  can_edit_other_users_w2l_templates: boolean,
  can_delete_other_users_tts_models: boolean,
  can_delete_other_users_tts_results: boolean,
  can_delete_other_users_w2l_templates: boolean,
  can_delete_other_users_w2l_results: boolean,
  can_ban_users: boolean,
  can_delete_users: boolean,
}

// Responses from the `/session` endpoint.
export interface SessionResponse {
  // API call was successful
  success: boolean,
  // Whether the user is logged in
  logged_in?: boolean,
  // Extended user details (only if logged in)
  user?: UserInfo | undefined | null,

  // if success is false, there will be an error_reason
  error_reason?: string,
}

