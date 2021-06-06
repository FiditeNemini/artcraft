

export class W2lTemplateUploadJob {
  jobToken: string;
  status: string;
  maybeW2lTemplateToken?: string;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    maybeW2lTemplateToken?: string
  ) {
    this.status = status;
    this.jobToken = jobToken;
    if (maybeW2lTemplateToken !== undefined) {
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
  maybe_template_token?: string,
  status: string,
  created_at: string,
  updated_at: string,
}
