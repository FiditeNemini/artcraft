import MakeRequest from "../MakeRequest";

export interface EnqueueImageGenRequest {
  loRA_path: String,
  check_point: String,
  vae: String
}

export interface EnqueueImageGenResponse {
  success: boolean
}

export const EnqueueImageGen = MakeRequest<string, EnqueueImageGenRequest, EnqueueImageGenResponse,{}>({
  method: "POST", 
  routingFunction: () => "/v1/inference/enqueue_image_gen",
});