

export class TtsInferenceJob {
  jobToken: string;
  modelToken?: string;
  status: string;
  title?: string;
  maybeResultToken: string | undefined | null;
  maybePublicBucketWavAudioPath: string | undefined | null;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    modelToken: string | undefined = undefined,
    title: string | undefined = undefined,
    maybeResulToken: string | undefined | null = null,
    maybePublicBucketWavAudioPath: string | undefined | null = null,
  ) {
    this.status = status;
    this.jobToken = jobToken;
    this.maybeResultToken = maybeResulToken;
    if (!!modelToken) {
      this.modelToken = modelToken;
    }
    if (!!title) {
      this.title = title;
    }
    this.maybePublicBucketWavAudioPath = maybePublicBucketWavAudioPath;
  }

  static fromResponse(response: TtsInferenceJobState) :  TtsInferenceJob {
    return new TtsInferenceJob(
      response.job_token,
      response.status,
      response.model_token,
      response.title,
      response.maybe_result_token,
      response.maybe_public_bucket_wav_audio_path
    );
  }
}

export interface TtsInferenceJobStateResponsePayload {
  success: boolean,
  state?: TtsInferenceJobState,
}

export interface TtsInferenceJobState {
  job_token: string,
  status: string,
  maybe_result_token: string | null,
  maybe_public_bucket_wav_audio_path: string | null,
  model_token: string,
  tts_model_type: string,
  title: string,
  created_at: string,
  updated_at: string,
}
