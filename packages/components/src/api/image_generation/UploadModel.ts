import MakeRequest from "../MakeRequest";

export interface UploadModelRequest {
  uuid_idempotency_token: String,
  type_of_inference: String, // upload_lora / check_point / inference
  maybe_upload_path?: String,
  maybe_lora_upload_path?: String,
  title: String,
  visibility: String,
  description: String
}

export interface UploadModelResponse {
  success: boolean,
  maybe_sd_model_token?: String,
  maybe_lora_model_token?: String,
}

export const UploadModel = MakeRequest<string, UploadModelRequest, UploadModelResponse,{}>({
    method: "POST", 
    routingFunction: () => "/v1/image_gen/model/upload",
});