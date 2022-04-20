import { JobState, jobStateFromString } from "./JobStates";


export class W2lTemplateUploadJob {
  jobToken: string;
  jobState: JobState;
  maybeExtraStatusDescription: string | null;
  maybeFailureReason: string | null;
  attemptCount: number;
  maybeW2lTemplateToken: string | undefined | null;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    maybeExtraStatusDescription: string | null = null,
    maybeFailureReason: string | null = null,
    attemptCount: number = 0,
    maybeW2lTemplateToken: string | undefined | null = null
  ) {
    this.jobState = jobStateFromString(status);
    this.maybeExtraStatusDescription = maybeExtraStatusDescription;
    this.maybeFailureReason = maybeFailureReason;
    this.attemptCount = attemptCount;
    this.jobToken = jobToken;
    if (!!maybeW2lTemplateToken) {
      this.maybeW2lTemplateToken = maybeW2lTemplateToken;
    }
  }

  static fromResponse(response: W2lTemplateUploadJobState) :  W2lTemplateUploadJob {
    return new W2lTemplateUploadJob(
      response.job_token,
      response.status,
      response.maybe_extra_status_description || null,
      response.maybe_failure_reason || null,
      response.attempt_count || 0,
      response.maybe_template_token,
    );
  }
}

export interface W2lTemplateUploadJobStateResponsePayload {
  success: boolean,
  state?: W2lTemplateUploadJobState,
}

export interface W2lTemplateUploadJobState {
  job_token: string,
  maybe_template_token: string | null,
  status: string,
  maybe_extra_status_description: string | null,
  maybe_failure_reason: string | null,
  attempt_count: number | null,
  created_at: string,
  updated_at: string,
}
