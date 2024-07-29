import { ApiConfig } from "../ApiConfig";

export interface DetectLocaleSuccessResponse {
  success: boolean,
  // BCP47 tags
  full_language_tags: string[],
  // Two letter codes
  language_codes: string[],
}

export interface DetectLocaleErrorResponse {
  success: boolean,
}

type DetectLocaleResponse = DetectLocaleSuccessResponse | DetectLocaleErrorResponse;

export function DetectLocaleIsOk(response: DetectLocaleResponse): response is DetectLocaleSuccessResponse {
  return response?.success === true;
}

export function DetectLocaleIsError(response: DetectLocaleResponse): response is DetectLocaleErrorResponse {
  return response?.success === false;
}

export async function DetectLocale() : Promise<DetectLocaleResponse> 
{
  const endpoint = new ApiConfig().detectLocale();
  
  return await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
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
