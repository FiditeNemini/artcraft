
export class W2lInferenceJob {
  jobToken: string;
  maybeW2lTemplateToken: string | undefined | null;
  status: string;
  title?: string;
  maybeResultToken: string | undefined | null;
  maybePublicBucketVideoPath: string | undefined | null;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    maybeW2lTemplateToken: string | undefined | null = undefined,
    title: string | undefined = undefined,
    maybeResulToken: string | undefined | null = undefined,
    maybePublicBucketVideoPath: string | undefined | null = undefined,
  ) {
    this.status = status;
    this.jobToken = jobToken;
    this.maybeResultToken = maybeResulToken;
    this.maybeW2lTemplateToken = maybeW2lTemplateToken;
    if (!!title) {
      this.title = title;
    }
    this.maybePublicBucketVideoPath = maybePublicBucketVideoPath;
  }

  static fromResponse(response: W2lInferenceJobState) :  W2lInferenceJob {
    return new W2lInferenceJob(
      response.job_token,
      response.status,
      response.maybe_w2l_template_token,
      response.title,
      response.maybe_result_token,
      response.maybe_public_bucket_video_path
    );
  }
}

export interface W2lInferenceJobStateResponsePayload {
  success: boolean,
  state?: W2lInferenceJobState,
}

export interface W2lInferenceJobState {
  job_token: string,
  status: string,
  maybe_result_token: string | undefined | null,
  maybe_public_bucket_video_path: string | undefined | null,
  maybe_w2l_template_token: string | undefined | null,
  w2l_template_type: string,
  title: string,
  created_at: string,
  updated_at: string,
}
