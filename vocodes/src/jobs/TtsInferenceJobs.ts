import { JobState, jobStateFromString } from "./JobStates";


export class TtsInferenceJob {
  jobToken: string;
  modelToken?: string;
  jobState: JobState;
  attemptCount: number;
  title?: string;
  maybeResultToken: string | undefined | null;
  maybePublicBucketWavAudioPath: string | undefined | null;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    attemptCount: number = 0,
    modelToken: string | undefined = undefined,
    title: string | undefined = undefined,
    maybeResulToken: string | undefined | null = null,
    maybePublicBucketWavAudioPath: string | undefined | null = null,
  ) {
    this.jobState = jobStateFromString(status);
    this.attemptCount = attemptCount;
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
      response.attempt_count || 0,
      response.model_token,
      response.title,
      response.maybe_result_token,
      response.maybe_public_bucket_wav_audio_path
    );
  }

  public jobStateCanChange() : boolean {
    switch (this.jobState) {
      case JobState.UNKNOWN:
      case JobState.PENDING:
      case JobState.STARTED:
      case JobState.ATTEMPT_FAILED:
        return true;
      case JobState.COMPLETE_SUCCESS:
      case JobState.COMPLETE_FAILURE:
      case JobState.DEAD:
      default:
        return false;
    }
  }
}

export interface TtsInferenceJobStateResponsePayload {
  success: boolean,
  state?: TtsInferenceJobState,
}

export interface TtsInferenceJobState {
  job_token: string,
  status: string,
  attempt_count: number | null,
  maybe_result_token: string | null,
  maybe_public_bucket_wav_audio_path: string | null,
  model_token: string,
  tts_model_type: string,
  title: string,
  created_at: string,
  updated_at: string,
}
