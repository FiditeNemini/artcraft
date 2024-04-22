import { listTts, inferTts } from '~/api';
import {
  TtsModelListItem,
  TtsModelListResponsePayload,
  GenerateTtsAudioErrorType,
  StatusLike,
  GenerateTtsAudioRequest,
  // GenerateTtsAudioSuccess,
  // GenerateTtsAudioError,
  GenerateTtsAudioResponse,
} from '~/pages/PageEnigma/models/tts';

export async function ListTtsModels() : Promise<Array<TtsModelListItem>| undefined> {  
  return await fetch(listTts, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
    const response : TtsModelListResponsePayload = res;
    if (!response.success) {
      return;
    }
    return response?.models;
  })
  .catch(e => {
    return undefined;
  });
}

export function maybeMapError(statuslike: StatusLike) : GenerateTtsAudioErrorType | undefined {
  switch (statuslike.status) {
    case 400:
      return GenerateTtsAudioErrorType.BadRequest;
    case 404:
      return GenerateTtsAudioErrorType.NotFound;
    case 429:
      return GenerateTtsAudioErrorType.TooManyRequests;
    case 500:
      return GenerateTtsAudioErrorType.ServerError;
  }
}

// export function GenerateTtsAudioIsError(response: GenerateTtsAudioResponse): response is GenerateTtsAudioError {
//   return !('inference_job_token' in response);
// }

export async function GenerateTtsAudio(request: GenerateTtsAudioRequest) : Promise<GenerateTtsAudioResponse>
{
  return await fetch(inferTts, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    },
    // credentials: 'include',
    body: JSON.stringify(request),
  })
  .then(res =>  res.json())
  .then(res => {
    if (!('inference_job_token' in res)) {
      return { error: GenerateTtsAudioErrorType.UnknownError };
    }
    const ret:GenerateTtsAudioResponse = {
      success: true,
      inference_job_token: res.inference_job_token,
      inference_job_token_type: res.inference_job_token_type,
    }
    return ret;
  })
  .catch(e => {
    let maybeError = maybeMapError(e);
    if (maybeError !== undefined) {
      return { error: maybeError };
    }
    return { error: GenerateTtsAudioErrorType.UnknownError };
  });

};