

export class W2lTemplateUploadJob {
  jobToken: string;
  status: string;
  maybeW2lTemplateToken: string | undefined | null;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    maybeW2lTemplateToken: string | undefined | null = null
  ) {
    this.status = status;
    this.jobToken = jobToken;
    if (!!maybeW2lTemplateToken) {
      this.maybeW2lTemplateToken = maybeW2lTemplateToken;
    }
  }

  static fromResponse(response: W2lTemplateUploadJobState) :  W2lTemplateUploadJob {
    return new W2lTemplateUploadJob(
      response.job_token,
      response.status,
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
  created_at: string,
  updated_at: string,
}
