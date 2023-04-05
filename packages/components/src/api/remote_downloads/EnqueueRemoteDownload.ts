import { ApiConfig } from "../ApiConfig";

export interface EnqueueRemoteDownloadRequest {
  idempotency_token: string,
  title: string,
  download_url: string,
  generic_download_type: string,
}

export interface EnqueueRemoteDownloadSuccessResponse {
  success: boolean,
  job_token: string,
}

export interface EnqueueRemoteDownloadErrorResponse {
  success: boolean,
}

type EnqueueRemoteDownloadResponse = EnqueueRemoteDownloadSuccessResponse | EnqueueRemoteDownloadErrorResponse;

export function EnqueueRemoteDownloadIsOk(response: EnqueueRemoteDownloadResponse): response is EnqueueRemoteDownloadSuccessResponse {
  return response?.success === true;
}

export function EnqueueRemoteDownloadIsError(response: EnqueueRemoteDownloadResponse): response is EnqueueRemoteDownloadErrorResponse {
  return response?.success === false;
}

export async function EnqueueRemoteDownload(request: EnqueueRemoteDownloadRequest) : Promise<EnqueueRemoteDownloadResponse> 
{
  const endpoint = new ApiConfig().enqueueRemoteDownloadJob();
  
  return fetch(endpoint, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(request),
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
