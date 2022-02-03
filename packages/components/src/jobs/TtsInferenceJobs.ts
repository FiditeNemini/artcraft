import { TtsInferenceJobStatus } from "../api/jobs/GetTtsInferenceJobStatus";
import { JobState, jobStateFromString } from "./JobStates";

export class TtsInferenceJob {
  jobToken: string;
  modelToken?: string;
  jobState: JobState;
  maybeExtraStatusDescription: string | null;
  attemptCount: number;
  title?: string;
  maybeResultToken: string | undefined | null;
  maybePublicBucketWavAudioPath: string | undefined | null;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    maybeExtraStatusDescription: string | null = null,
    attemptCount: number = 0,
    modelToken: string | undefined = undefined,
    title: string | undefined = undefined,
    maybeResulToken: string | undefined | null = null,
    maybePublicBucketWavAudioPath: string | undefined | null = null,
  ) {
    this.jobState = jobStateFromString(status);
    this.maybeExtraStatusDescription = maybeExtraStatusDescription;
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

  static fromResponse(response: TtsInferenceJobState | TtsInferenceJobStatus) : TtsInferenceJob {
    return new TtsInferenceJob(
      response.job_token,
      response.status,
      response.maybe_extra_status_description || null,
      response.attempt_count || 0,
      response.model_token,
      response.title,
      response.maybe_result_token || null,
      response.maybe_public_bucket_wav_audio_path || null,
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
  maybe_extra_status_description: string | null,
  attempt_count: number | null,
  maybe_result_token: string | null,
  maybe_public_bucket_wav_audio_path: string | null,
  model_token: string,
  tts_model_type: string,
  title: string,
  created_at: string,
  updated_at: string,
}
