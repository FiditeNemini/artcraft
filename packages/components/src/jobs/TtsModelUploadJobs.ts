import { JobState, jobStateFromString } from "./JobStates";


export class TtsModelUploadJob {
  jobToken: string;
  maybeModelToken: string | undefined | null;
  jobState: JobState;
  maybeExtraStatusDescription: string | null;
  attemptCount: number;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    maybeExtraStatusDescription: string | null = null,
    attemptCount: number = 0,
    maybeModelToken: string | undefined | null = undefined
  ) {
    this.jobState = jobStateFromString(status);
    this.maybeExtraStatusDescription = maybeExtraStatusDescription;
    this.attemptCount = attemptCount;
    this.jobToken = jobToken;
    if (!!maybeModelToken) {
      this.maybeModelToken = maybeModelToken;
    }
  }

  static fromResponse(response: TtsInferenceJobState) :  TtsModelUploadJob {
    return new TtsModelUploadJob(
      response.job_token,
      response.status,
      response.maybe_extra_status_description || null,
      response.attempt_count || 0,
      response.maybe_model_token,
    );
  }
}

export interface TtsModelUploadJobStateResponsePayload {
  success: boolean,
  state?: TtsInferenceJobState,
}

export interface TtsInferenceJobState {
  job_token: string,
  status: string,
  maybe_extra_status_description: string | null,
  attempt_count: number | undefined,
  maybe_model_token: string | undefined | null,
  created_at: string,
  updated_at: string,
}
