import MakeRequest from "../MakeRequest";

export interface EnqueueActingFaceRequest {
  creator_set_visibility: "public" | "private";
  face_driver_media_file_token: string;
  remove_watermark: boolean;
  source_media_file_token: string;
  uuid_idempotency_token: string;
}

export interface EnqueueActingFaceResponse {
  inference_job_token?: string;
  success: boolean;
}

export const EnqueueActingFace = MakeRequest<
  string,
  EnqueueActingFaceRequest,
  EnqueueActingFaceResponse,
  {}
>({
  method: "POST",
  routingFunction: () => `/v1/workflows/enqueue_acting_face`,
});
