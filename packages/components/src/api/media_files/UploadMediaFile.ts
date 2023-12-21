import { ApiConfig } from "../ApiConfig";

export interface UploadMediaFileRequest {
  uuid_idempotency_token: string;
  file_name: string;
  file_bytes: any;
  media_source?: string;
}

export interface UploadMediaFileSuccessResponse {
  success: boolean;
  media_file_token: string;
}

export interface UploadMediaFileErrorResponse {
  success: boolean;
}

type UploadMediaFileResponse =
  | UploadMediaFileSuccessResponse
  | UploadMediaFileErrorResponse;

export function UploadMediaFileIsOk(
  response: UploadMediaFileResponse
): response is UploadMediaFileSuccessResponse {
  return response?.success === true;
}

export function UploadMediaFileIsError(
  response: UploadMediaFileResponse
): response is UploadMediaFileErrorResponse {
  return response?.success === false;
}

export async function UploadMediaFile(
  request: UploadMediaFileRequest
): Promise<UploadMediaFileResponse> {
  const endpoint = new ApiConfig().uploadMediaFile();

  const formData = new FormData();

  formData.append("uuid_idempotency_token", request.uuid_idempotency_token);
  formData.append("file_name", request.file_name);
  formData.append("file_bytes", request.file_bytes);

  if (request.media_source !== undefined) {
    formData.append("media_source", request.media_source);
  }

  return fetch(endpoint, {
    method: "POST",
    credentials: "include",
    headers: {
      Accept: "application/json",
    },
    body: formData,
  })
    .then(res => res.json())
    .then(res => {
      if (res && "success" in res) {
        return res;
      } else {
        return { success: false };
      }
    })
    .catch(e => {
      return { success: false };
    });
}
