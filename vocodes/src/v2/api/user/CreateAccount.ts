
import { ApiConfig } from "../../../common/ApiConfig";

export interface CreateAccountRequest {
  username: string,
  email_address: string,
  password: string,
  password_confirmation: string,
}

export interface CreateAccountSuccessResponse {
  success: boolean,
}

export interface CreateAccountErrorResponse {
  success: boolean,
  error_type: string,
  error_fields: { [key: string]: string; },
}

type CreateAccountResponse = CreateAccountSuccessResponse | CreateAccountErrorResponse;

export function CreateAccountIsSuccess(response: CreateAccountResponse): response is CreateAccountSuccessResponse {
  return response?.success === true;
}

export function CreateAccountIsError(response: CreateAccountResponse): response is CreateAccountErrorResponse {
  return response?.success === false;
}

export async function CreateAccount(request: CreateAccountRequest) : Promise<CreateAccountResponse> 
{
  const endpoint = new ApiConfig().createAccount();
  
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
