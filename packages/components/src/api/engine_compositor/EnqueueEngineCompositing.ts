import MakeRequest from "../MakeRequest";

export interface EnqueueEngineCompositingRequest {
  uuid_idempotency_token: string,
  video_source: string
}

export interface EnqueueEngineCompositingResponse {
  success: boolean,
  inference_job_token?: string
}

export const EnqueueEngineCompositing = MakeRequest<string, EnqueueEngineCompositingRequest, EnqueueEngineCompositingResponse,{}>({
  method: "POST",
  routingFunction: () => `/v1/compositor/enqueue_engine_compositing`,
});