import { listTts } from '~/api';
import {
  TtsModelListItem,
  TtsModelListResponsePayload,
  GenerateTtsAudioErrorType,
  StatusLike
} from './types';

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