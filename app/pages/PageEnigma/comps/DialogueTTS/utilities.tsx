import { listTts } from '~/api';
import {
  TtsModelListItem,
  TtsModelListResponsePayload
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