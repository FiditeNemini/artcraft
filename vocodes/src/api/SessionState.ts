
// Responses from the `/sessions` endpoint.
export interface SessionStateResponse {
  // API call was successful
  success: boolean,

  // Whether the user is logged in
  logged_in: boolean,

  // Extended user details (only if logged in)
  user_info?: UserInfo,
}

export interface UserInfo {
  user_token: string,
  username: string,
  display_name: string,
}
