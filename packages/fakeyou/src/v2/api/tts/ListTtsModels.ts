import { ApiConfig } from "@storyteller/components";

interface TtsModelListResponsePayload {
  success: boolean,
  models: Array<TtsModelListItem>,
}

export interface TtsModelListItem {
  model_token: string,
  tts_model_type: string,
  creator_user_token: string,
  creator_username: string,
  creator_display_name: string,
  creator_gravatar_hash: string,
  updatable_slug: string,
  title: string,
  category_tokens: string[],
  created_at: string,
  updated_at: string,
}

export async function ListTtsModels() : Promise<Array<TtsModelListItem>| undefined> {
  const endpoint = new ApiConfig().listTts();
  
  return await fetch(endpoint, {
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
