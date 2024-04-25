import { InferenceJobType } from "~/pages/PageEnigma/models/types";

export interface InferenceJob {
  version: number;
  job_id: string;
  job_type: InferenceJobType;
  job_status: string;
  result?: any;
}

export enum JobState {
  UNKNOWN = "unknown", // Only on frontend.
  PENDING = "pending",
  STARTED = "started",
  COMPLETE_SUCCESS = "complete_success",
  COMPLETE_FAILURE = "complete_failure",
  ATTEMPT_FAILED = "attempt_failed",
  DEAD = "dead",
  CANCELED_BY_USER = "canceled_by_user",
}
export interface RequestDetails {
  inference_category: string;
  maybe_model_type?: string;
  maybe_model_token?: string;
  maybe_model_title?: string;
  maybe_raw_inference_text?: string;
}

export interface StatusDetails {
  status: string;
  maybe_extra_status_description?: string;
  maybe_failure_category?: string;
  attempt_count: number;
}

export interface ResultDetails {
  entity_type: string;
  entity_token: string;
  maybe_public_bucket_media_path?: string;
}

export interface JobStatus {
  job_token: string;
  request: RequestDetails;
  status: StatusDetails;
  maybe_result?: ResultDetails;
  created_at: Date;
  updated_at: Date;
}

export interface GetJobStatusResponse {
  success: boolean;
  state: JobStatus;
}

export type ErrorResponse = {
  success: boolean;
  error_reason: string;
};
