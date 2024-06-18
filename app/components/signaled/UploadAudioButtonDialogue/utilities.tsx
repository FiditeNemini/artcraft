import { uploadMedia } from "~/api";

export interface UploadMediaRequest {
  uuid_idempotency_token: string;
  file: File;
  source: string;
  title: string;
}

export interface UploadMediaResponse {
  media_file_token: string;
  success: boolean;
}

export const UploadMedia = (request: UploadMediaRequest) => {
  const formData = new FormData();

  formData.append("uuid_idempotency_token", request.uuid_idempotency_token);
  formData.append("file", request.file);
  formData.append("source", request.source);
  formData.append("title", request.title);

  return fetch(uploadMedia, {
    method: "POST",
    headers: {
      Accept: "application/json",
    },
    credentials: "include",
    body: formData,
  })
    .then((res) => res.json())
    .then((res) => {
      if (res && res.success) {
        return res;
      }
      return { success: false };
    })
    .catch((e) => {
      return { success: false };
    });
};
