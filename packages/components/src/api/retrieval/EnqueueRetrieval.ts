import { ApiConfig } from "../ApiConfig";

export interface EnqueueRetrievalRequest {
  idempotency_token: string,
  title: string,
  download_url: string,
  generic_download_type: string,
}

export interface EnqueueRetrievalSuccessResponse {
  success: boolean,
  job_token: string,
}

export interface EnqueueRetrievalErrorResponse {
  success: boolean,
}

type EnqueueRetrievalResponse = EnqueueRetrievalSuccessResponse | EnqueueRetrievalErrorResponse;

export function EnqueueRetrievalIsOk(response: EnqueueRetrievalResponse): response is EnqueueRetrievalSuccessResponse {
  return response?.success === true;
}

export function EnqueueRetrievalIsError(response: EnqueueRetrievalResponse): response is EnqueueRetrievalErrorResponse {
  return response?.success === false;
}

export async function EnqueueRetrieval(request: EnqueueRetrievalRequest) : Promise<EnqueueRetrievalResponse> 
{
  const endpoint = new ApiConfig().enqueueRetrievalJob();
  
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
