import { VoiceConversionModelListItem } from "~/pages/PageEnigma/models/types";

export interface VoiceConversionModelListResponse {
  success: boolean;
  models: Array<VoiceConversionModelListItem>;
}

export interface EnqueueVoiceConversionRequest {
  uuid_idempotency_token: string;
  voice_conversion_model_token: string;
  source_media_upload_token: string;

  // Optional args
  // auto_predict_f0?: boolean,
  // override_f0_method?: EnqueueVoiceConversionFrequencyMethod,
  // transpose?: number,
}

export interface EnqueueVoiceConversionResponse {
  success: boolean;
  inference_job_token?: string;
}
