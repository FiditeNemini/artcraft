import { ApiConfig } from "../../../common/ApiConfig";

interface TtsModelViewResponsePayload {
  success: boolean,
  model: TtsModel,
}

export interface TtsModel {
  model_token: string,
  title: string,
  tts_model_type: string,
  maybe_default_pretrained_vocoder: string | null,
  text_preprocessing_algorithm: string,
  creator_user_token: string,
  creator_username: string,
  creator_display_name: string,
  creator_gravatar_hash: string,
  description_markdown: string,
  description_rendered_html: string,
  creator_set_visibility: string,
  updatable_slug: string,
  created_at: string,
  updated_at: string,
  maybe_moderator_fields: TtsModelModeratorFields | null | undefined,
}

export interface TtsModelModeratorFields {
  creator_ip_address_creation: string,
  creator_ip_address_last_update: string,
  mod_deleted_at: string | undefined | null,
  user_deleted_at: string | undefined | null,
}

export async function GetTtsModel(modelToken: string) : Promise<TtsModel | undefined> {
  const endpoint = new ApiConfig().viewTtsModel(modelToken);
  
  return await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
    const response : TtsModelViewResponsePayload = res;
    if (!response.success) {
      return;
    }
    return response?.model;
  })
  .catch(e => {
    return undefined;
  });
}
