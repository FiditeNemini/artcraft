import { listTts, listV2V, inferTts, listMediaByUser, getMediaFileByToken } from '~/api';
import {
  MediaFile,
  GetMediaFileResponse,
  VoiceConversionModelListItem,
  VoiceConversionModelListResponse,
} from './types';
import {
  TtsModelListItem,
  TtsModelListResponsePayload,
  GenerateTtsAudioErrorType,
  StatusLike,
  GenerateTtsAudioRequest,
  GenerateTtsAudioResponse,
} from '~/pages/PageEnigma/models/tts';



export const ListAudioByUser = async(username:string, sessionToken: string) => {
  return await fetch(listMediaByUser(username),{
    method: 'GET',
    headers: {
      "Accept": "application/json",
      'session': sessionToken,
    },
    // credentials: 'include'
  })
  .then(res => res.json())
  .then(res => { 
    if(res.success && res.results){
      return res.results.filter((item:MediaFile)=>item['media_type']==='audio');
    }else{
      Promise.reject();
    }
  })
  .catch(e => ({ success : false }));
}

export async function ListTtsModels(sessionToken:string) : Promise<Array<TtsModelListItem>| undefined> {  
  return await fetch(listTts, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'session': sessionToken,
    },
    // credentials: 'include',
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

export async function GenerateTtsAudio(request: GenerateTtsAudioRequest, sessionToken:string) : Promise<GenerateTtsAudioResponse>
{
  return await fetch(inferTts, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'session': sessionToken,
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

export async function GetMediaFileByToken (fileToken: string, sessionToken: string) : Promise<GetMediaFileResponse>
{
  return await fetch(getMediaFileByToken(fileToken), {
    method: "GET",
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'session': sessionToken,
    },
  })
  .then(res =>  res.json())
  .then(res => {
    const response: GetMediaFileResponse = res;

      if (response && response.success && response.media_file) {
        // NB: Timestamps aren't converted to Date objects on their own!
        response.media_file.created_at = new Date(
          response.media_file.created_at
        );
        response.media_file.updated_at = new Date(
          response.media_file.updated_at
        );
        return response;
      } else {
        return { success: false };
      }
  })
  .catch(e => {
    return { success: false };
  });
  ;
}

export async function ListVoiceConversionModels(sessionToken: string) : Promise<Array<VoiceConversionModelListItem>| undefined> {
  return await fetch(listV2V, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'session': sessionToken,
    },
  })
  .then(res => res.json())
  .then(res => {
    const response : VoiceConversionModelListResponse = res;
    if (!response.success) {
      return;
    }
    return response?.models;
  })
  .catch(e => {
    return undefined;
  });
}