import { ApiConfig } from "../ApiConfig";

export interface UploadRequest {
  uuid_idempotency_token: string,
  source?: string, // eg. "device", "file"
  type: string, // "audio", "image", "video"
  file: any,
};

export interface UploadResponse {
  success: boolean,
  upload_token?: string,
}

const { uploadAudio, uploadImage, uploadVideo } = new ApiConfig();

const audio =  new ApiConfig().uploadAudio();
const image =  new ApiConfig().uploadImage();
const video =  new ApiConfig().uploadVideo();

const endpoints = { audio, image, video };

export async function Upload(request: UploadRequest) : Promise<UploadResponse> 
{
  
  const formData = new FormData();

  formData.append('uuid_idempotency_token', request.uuid_idempotency_token);
  formData.append('file', request.file);

  if (request.source !== undefined) {
    formData.append('source', request.source);
  }

  return fetch(endpoints[request.type as keyof typeof endpoints], {
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