import { ApiConfig } from "../../../common/ApiConfig";

interface TtsInferenceResultResponsePayload {
  success: boolean,
  result: TtsResult,
}

export interface TtsResult {
  tts_result_token: string,

  tts_model_token: string,
  tts_model_title: string,

  maybe_pretrained_vocoder_used: string | null,

  raw_inference_text: string,

  maybe_creator_user_token?: string,
  maybe_creator_username?: string,
  maybe_creator_display_name?: string,
  maybe_creator_gravatar_hash?: string,

  maybe_model_creator_user_token?: string,
  maybe_model_creator_username?: string,
  maybe_model_creator_display_name?: string,
  maybe_model_creator_gravatar_hash?: string,

  public_bucket_wav_audio_path: string,
  public_bucket_spectrogram_path: string,

  creator_set_visibility?: string,

  file_size_bytes: number,
  duration_millis: number,
  created_at: string,
  updated_at: string,

  maybe_moderator_fields: TtsInferenceResultModeratorFields | null | undefined,
}

export interface TtsInferenceResultModeratorFields {
  creator_ip_address: string,
  mod_deleted_at: string | undefined | null,
  user_deleted_at: string | undefined | null,
}

export async function GetTtsResult(resultToken: string) : Promise<TtsResult | undefined> {
  const endpoint = new ApiConfig().viewTtsInferenceResult(resultToken);
  
  return await fetch(endpoint, {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
    credentials: 'include',
  })
  .then(res => res.json())
  .then(res => {
    const response : TtsInferenceResultResponsePayload = res;
    if (!response.success) {
      return;
    }
    return response?.result;
  })
  .catch(e => {
    return undefined;
  });
}
