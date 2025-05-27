import { invoke } from "@tauri-apps/api/core";
import { CommandResult } from "../common/CommandStatus";

export enum EnqueueTextToImageErrorType {
  /// Caller didn't specify a model
  ModelNotSpecified = "model_not_specified",
  /// Generic server error
  ServerError = "server_error",
  /// No Fal API key available
  NeedsFalApiKey = "needs_fal_api_key",
  /// Fal had an API error
  FalError = "fal_error",
}

export interface EnqueueTextToImageRequest {
  prompt?: string;
  model?: EnqueueTextToImageModel;
}

export enum EnqueueTextToImageModel {
  FluxProUltra = "flux_pro_ultra",
  GptImage1 = "gpt_image_1",
  Recraft3 = "recraft_3",
}

export interface EnqueueTextToImageError extends CommandResult {
  error_type: EnqueueTextToImageErrorType;
  error_message?: string;
}

export interface EnqueueTextToImagePayload {
  media_token: string;
  cdn_url: string;
  base64_bytes: string;
}

export interface EnqueueTextToImageSuccess extends CommandResult {
  payload: EnqueueTextToImagePayload;
}

export type EnqueueTextToImageResult = EnqueueTextToImageSuccess | EnqueueTextToImageError;

export const EnqueueTextToImage = async (request: EnqueueTextToImageRequest) : Promise<EnqueueTextToImageResult> => {
  let result = await invoke("enqueue_text_to_image_command", { 
    request: {
      prompt: request.prompt,
      model: request.model,
    }
  });
  return (result as EnqueueTextToImageResult);
}
