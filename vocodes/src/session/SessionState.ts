
// Responses from the `/sessions` endpoint.
export interface SessionStateResponse {
  // API call was successful
  success: boolean,

  // Whether the user is logged in
  logged_in: boolean,

  // Extended user details (only if logged in)
  user: UserInfo | undefined | null,
}

export interface UserInfo {
  user_token: string,
  username: string,
  display_name: string,
  email_gravatar_hash: string,

  // Usage
  can_use_tts: boolean,
  can_use_w2l: boolean,
  // Contribution
  can_upload_tts_models: boolean,
  can_upload_w2l_templates: boolean,
  // Moderation
  can_ban_users: boolean,
  can_edit_other_users_data: boolean,
  can_approve_w2l_templates: boolean,
}
