

export class TtsModelUploadJob {
  jobToken: string;
  maybeModelToken: string | undefined | null;
  status: string;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    maybeModelToken: string | undefined | null = undefined
  ) {
    this.status = status;
    this.jobToken = jobToken;
    if (!!maybeModelToken) {
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
  maybe_model_token: string | undefined | null,
  created_at: string,
  updated_at: string,
}
