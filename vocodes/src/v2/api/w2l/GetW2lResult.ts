import { ApiConfig } from "../../../common/ApiConfig";

interface W2lInferenceResultResponsePayload {
  success: boolean,
  result: W2lResult,
}

export interface W2lResult {
  w2l_result_token: string,
  maybe_w2l_template_token?: string,
  maybe_tts_inference_result_token?: string,
  public_bucket_video_path: string,
  template_type: string,
  template_title: string,

  maybe_creator_user_token?: string,
  maybe_creator_username?: string,
  maybe_creator_display_name?: string,
  maybe_creator_gravatar_hash?: string,

  maybe_template_creator_user_token?: string,
  maybe_template_creator_username?: string,
  maybe_template_creator_display_name?: string,
  maybe_template_creator_gravatar_hash?: string,

  creator_set_visibility?: string,

  file_size_bytes: number,
  frame_width: number,
  frame_height: number,
  duration_millis: number,
  created_at: string,
  updated_at: string,

  maybe_moderator_fields: W2lInferenceResultModeratorFields | null | undefined,
}

export interface W2lInferenceResultModeratorFields {
  creator_ip_address: string,
  mod_deleted_at: string | undefined | null,
  user_deleted_at: string | undefined | null,
}

export async function GetW2lResult(resultToken: string) : Promise<W2lResult | undefined> {
    const endpoint = new ApiConfig().viewW2lInferenceResult(resultToken);

    return await fetch(endpoint, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
      credentials: 'include',
    })
    .then(res => res.json())
    .then(res => {
      const response : W2lInferenceResultResponsePayload  = res;
      if (!response.success) {
        return;
      }
      return response?.result;
    })
    .catch(e => {
      return undefined;
    });
}
