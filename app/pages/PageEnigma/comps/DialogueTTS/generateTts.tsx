import { inferTts } from "~/api";
import {
  GenerateTtsAudioRequest,
  GenerateTtsAudioSuccess,
  GenerateTtsAudioError,
  GenerateTtsAudioResponse,
  GenerateTtsAudioErrorType,
  EndpointResponse
} from './types';

import {
  maybeMapError
} from './utilities';

export function GenerateTtsAudioIsError(response: GenerateTtsAudioResponse): response is GenerateTtsAudioError {
  return !('inference_job_token' in response);
}

export async function GenerateTtsAudio(request: GenerateTtsAudioRequest) : Promise<GenerateTtsAudioResponse | undefined>
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
    const ret:GenerateTtsAudioSuccess = {
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
