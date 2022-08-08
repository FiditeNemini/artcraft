import { ApiConfig } from "../ApiConfig";

export interface GetRetrievalJobStatusSuccessResponse {
  success: boolean,
  state: RetrievalJobStatus,
}

export interface RetrievalJobStatus {
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

export interface GetRetrievalJobStatusErrorResponse {
  success: boolean,
}

type GetRetrievalJobStatusResponse = GetRetrievalJobStatusSuccessResponse | GetRetrievalJobStatusErrorResponse;

export function GetRetrievalJobStatusIsOk(response: GetRetrievalJobStatusResponse): response is GetRetrievalJobStatusSuccessResponse {
  return response?.success === true;
}

export function GetRetrievalJobStatusIsError(response: GetRetrievalJobStatusResponse): response is GetRetrievalJobStatusErrorResponse {
  return response?.success === false;
}

export async function GetRetrievalJobStatus(jobToken: string) : Promise<GetRetrievalJobStatusResponse> 
{
  const endpoint = new ApiConfig().getRetrievalJobStatus(jobToken);
  
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
