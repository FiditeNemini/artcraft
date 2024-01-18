import { ApiConfig } from "../ApiConfig";

export interface UploadVideoRequest {
  uuid_idempotency_token: string,
  source?: string, // eg. "device", "file"
  file: any,
}

export interface UploadVideoSuccessResponse {
  success: boolean,
  upload_token: string,
}

export interface UploadVideoErrorResponse {
  success: boolean,
}

type UploadVideoResponse = UploadVideoSuccessResponse | UploadVideoErrorResponse;

export function UploadVideoIsOk(response: UploadVideoResponse): response is UploadVideoSuccessResponse {
  return response?.success === true;
}

export function UploadVideoIsError(response: UploadVideoResponse): response is UploadVideoErrorResponse {
  return response?.success === false;
}

export async function UploadVideo(request: UploadVideoRequest) : Promise<UploadVideoResponse> 
{
  //TODO: Upload Video Endpoint doesn't exist yet
  //const endpoint = new ApiConfig().uploadVideo();
  const endpoint = new ApiConfig().uploadMedia();
  
  const formData = new FormData();

  formData.append('uuid_idempotency_token', request.uuid_idempotency_token);
  formData.append('file', request.file);

  if (request.source !== undefined) {
    formData.append('source', request.source);
  }

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
