import { uploadAudioV2V } from "~/api";
import { authentication } from "~/signals";
export interface UploadAudioRequest {
  uuid_idempotency_token: string;
  source?: string; // eg. "device", "file"
  file: any;
}

export interface UploadAudioResponse {
  success: boolean;
  upload_token?: string;
}

export function UploadAudioIsOk(response: UploadAudioResponse) {
  return response?.success === true;
}

export async function UploadAudio(
  request: UploadAudioRequest,
): Promise<UploadAudioResponse> {
  const formData = new FormData();

  formData.append("uuid_idempotency_token", request.uuid_idempotency_token);
  formData.append("file", request.file);

  if (request.source !== undefined) {
    formData.append("source", request.source);
  }

  return fetch(uploadAudioV2V, {
    method: "POST",
    headers: {
      Accept: "application/json",
      session: authentication.sessionToken.value || "",
    },
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && "success" in res) {
        return res;
      }
      return { success: false };
    })
    .catch((e) => {
      return { success: false };
    });
}
