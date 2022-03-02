import { ApiConfig } from "../../ApiConfig";

export interface CheckTwitchOauthSuccessResponse {
  success: boolean,
  oauth_token_found: boolean,
}

export interface CheckTwitchOauthErrorResponse {
  success: boolean,
}

type CheckTwitchOauthResponse = CheckTwitchOauthSuccessResponse | CheckTwitchOauthErrorResponse;

export function CheckTwitchOauthIsOk(response: CheckTwitchOauthResponse): response is CheckTwitchOauthSuccessResponse {
  return response?.success === true;
}

export function CheckTwitchOauthIsError(response: CheckTwitchOauthResponse): response is CheckTwitchOauthErrorResponse {
  return response?.success === false;
}

export async function CheckTwitchOauth() : Promise<CheckTwitchOauthResponse> 
{
  const endpoint = new ApiConfig().checkTwitchOauthStatus();
  
  return await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
    if (!res) {
      return { success : false }; // TODO: This loses error semantics and is deprecated
    }

    if (res && 'success' in res) {
      return res;
    } else {
      return { success : false };
    }
  })
  .catch(e => {
    return { success : false };
  });
}
