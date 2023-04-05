import { ApiConfig } from "../ApiConfig";

export interface GetRemoteDownloadJobStatusSuccessResponse {
  success: boolean,
  state: RemoteDownloadJobStatus,
}

export interface RemoteDownloadJobStatus {
  // Job primary key
  job_token: string,

  // Job state machine (enum) and retry count
  status: string,
  attempt_count: number,

  // Optional unstructured extra details during the inference process
  maybe_extra_status_description?: string,

  // Job completion: foreign key to entity
  maybe_downloaded_entity_type?: string,
  maybe_downloaded_entity_token?: string,
  
  created_at: Date,
  updated_at: Date,
}

export interface GetRemoteDownloadJobStatusErrorResponse {
  success: boolean,
}

type GetRemoteDownloadJobStatusResponse = GetRemoteDownloadJobStatusSuccessResponse | GetRemoteDownloadJobStatusErrorResponse;

export function GetRemoteDownloadJobStatusIsOk(response: GetRemoteDownloadJobStatusResponse): response is GetRemoteDownloadJobStatusSuccessResponse {
  return response?.success === true;
}

export function GetRemoteDownloadJobStatusIsError(response: GetRemoteDownloadJobStatusResponse): response is GetRemoteDownloadJobStatusErrorResponse {
  return response?.success === false;
}

export async function GetRemoteDownloadJobStatus(jobToken: string) : Promise<GetRemoteDownloadJobStatusResponse> 
{
  const endpoint = new ApiConfig().getRemoteDownloadJobStatus(jobToken);
  
  return fetch(endpoint, {
    method: 'GET',
    credentials: 'include',
    headers: {
      'Accept': 'application/json',
    },
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
