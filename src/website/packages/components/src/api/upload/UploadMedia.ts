import { ApiConfig } from "../ApiConfig";

export interface UploadMediaRequest {
  uuid_idempotency_token: string,
  file: any,
}

export interface UploadMediaSuccessResponse {
  success: boolean,
  upload_token: string,
}

export interface UploadMediaErrorResponse {
  success: boolean,
}

type UploadMediaResponse = UploadMediaSuccessResponse | UploadMediaErrorResponse;

export function UploadMediaIsOk(response: UploadMediaResponse): response is UploadMediaSuccessResponse {
  return response?.success === true;
}

export function UploadMediaIsError(response: UploadMediaResponse): response is UploadMediaErrorResponse {
  return response?.success === false;
}

export async function UploadMedia(request: UploadMediaRequest) : Promise<UploadMediaResponse> 
{
  const endpoint = new ApiConfig().uploadMedia();
  
  const formData = new FormData();

  formData.append('uuid_idempotency_token', request.uuid_idempotency_token);
  formData.append('file', request.file);

  return fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
    body: formData,
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
