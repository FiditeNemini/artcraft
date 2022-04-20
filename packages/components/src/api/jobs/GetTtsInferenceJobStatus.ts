import { ApiConfig } from "../ApiConfig";

export interface GetTtsInferenceJobStatusSuccessResponse {
  success: boolean,
  state: TtsInferenceJobStatus,
}

export interface TtsInferenceJobStatus {
  // Job primary key
  job_token: string,

  // Job state machine (enum) and retry count
  status: string,
  attempt_count: number,

  // TTS model foreign key
  model_token: string,

  // Optional unstructured extra details during the inference process
  maybe_extra_status_description?: string,
  
  // Job completion: inference result token and audio path
  maybe_result_token?: string,
  maybe_public_bucket_wav_audio_path?: string,

  tts_model_type: string,
  title: string,

  raw_inference_text: string,

  created_at: Date,
  updated_at: Date,
}

export interface GetTtsInferenceJobStatusErrorResponse {
  success: boolean,
}

type GetTtsInferenceJobStatusResponse = GetTtsInferenceJobStatusSuccessResponse | GetTtsInferenceJobStatusErrorResponse;

export function GetTtsInferenceJobStatusIsOk(response: GetTtsInferenceJobStatusResponse): response is GetTtsInferenceJobStatusSuccessResponse {
  return response?.success === true;
}

export function GetTtsInferenceJobStatusIsError(response: GetTtsInferenceJobStatusResponse): response is GetTtsInferenceJobStatusErrorResponse {
  return response?.success === false;
}

export async function GetTtsInferenceJobStatus(jobToken: string) : Promise<GetTtsInferenceJobStatusResponse> 
{
  const endpoint = new ApiConfig().getTtsInferenceJobState(jobToken);
  
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
