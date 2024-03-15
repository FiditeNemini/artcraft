import MakeRequest from "../MakeRequest";

export interface EnqueueVSTRequest {
  creator_set_visibility: string,
  enable_lipsync: boolean,
  negative_prompt: string,
  prompt: string,
  style: string,
  trim_end_millis: number,
  trim_start_millis: number,
  uuid_idempotency_token: string
}

export interface EnqueueVSTResponse {
  inference_job_token?: string,
  success: boolean
}

export const EnqueueVST = MakeRequest<string,EnqueueVSTRequest,EnqueueVSTResponse,{}>({
  method: "POST",
  routingFunction: () => `/v1/video/enqueue_vst`,
});
