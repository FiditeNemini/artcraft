import MakeRequest from "../MakeRequest";

export interface EditUsernameRequest {
  display_name: string;
}

export interface EditUsernameResponse {
  success: boolean;
}

export const EditUsername = MakeRequest<
  string,
  EditUsernameRequest,
  EditUsernameResponse,
  {}
>({
  method: "POST",
  routingFunction: () => "/v1/user/edit_username",
});
