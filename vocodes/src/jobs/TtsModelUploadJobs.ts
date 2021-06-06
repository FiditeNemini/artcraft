

export class TtsModelUploadJob {
  jobToken: string;
  maybeModelToken?: string;
  status: string;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    maybeModelToken?: string 
  ) {
    this.status = status;
    this.jobToken = jobToken;
    if (maybeModelToken !== undefined) {
      this.maybeModelToken = maybeModelToken;
    }
  }

  static fromResponse(response: TtsInferenceJobState) :  TtsModelUploadJob {
    return new TtsModelUploadJob(
      response.job_token,
      response.status,
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
  maybe_model_token?: string,
  created_at: string,
  updated_at: string,
}
