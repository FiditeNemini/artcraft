import { ApiConfig } from "../../../common/ApiConfig";

export interface CreateSessionRequest {
  username_or_email: string,
  password: string,
}

export interface CreateSessionSuccessResponse {
  success: boolean,
}

export interface CreateSessionErrorResponse {
  success: boolean,
  error_type: string,
  error_message: string,
}

type CreateSessionResponse = CreateSessionSuccessResponse | CreateSessionErrorResponse;

export function CreateSessionIsSuccess(response: CreateSessionResponse): response is CreateSessionSuccessResponse {
  return response?.success === true;
}

export function CreateSessionIsError(response: CreateSessionResponse): response is CreateSessionErrorResponse {
  return response?.success === false;
}

export async function CreateSession(request: CreateSessionRequest) : Promise<CreateSessionResponse> 
{
  const endpoint = new ApiConfig().login();
  
  return await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: JSON.stringify(request),
  })
  .then(res => res.json())
  .then(res => {
    if (!res) {
      return { success : false };
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
