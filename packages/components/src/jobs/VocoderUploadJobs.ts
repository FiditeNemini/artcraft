import { RetrievalJobStatus } from "../api/retrieval/GetRetrievalJobStatus";
import { JobState, jobStateFromString } from "./JobStates";


export class VocoderUploadJob {
  jobToken: string;
  maybeDownloadedEntityType: string | undefined | null;
  maybeDownloadedEntityToken: string | undefined | null;
  jobState: JobState;
  maybeExtraStatusDescription: string | null;
  attemptCount: number;

  constructor(
    jobToken: string, 
    status: string = 'unknown',
    maybeExtraStatusDescription: string | null = null,
    attemptCount: number = 0,
    maybeDownloadedEntityType: string | undefined | null = undefined,
    maybeDownloadedEntityToken: string | undefined | null = undefined
  ) {
    this.jobState = jobStateFromString(status);
    this.maybeExtraStatusDescription = maybeExtraStatusDescription;
    this.attemptCount = attemptCount;
    this.jobToken = jobToken;
    if (!!maybeDownloadedEntityType) {
      this.maybeDownloadedEntityType = maybeDownloadedEntityType;
    }
    if (!!maybeDownloadedEntityToken) {
      this.maybeDownloadedEntityToken = maybeDownloadedEntityToken;
    }
  }

  static fromResponse(response: RetrievalJobStatus) :  VocoderUploadJob {
    return new VocoderUploadJob(
      response.job_token,
      response.status,
      response.maybe_extra_status_description || null,
      response.attempt_count || 0,
      response.maybe_downloaded_entity_type,
      response.maybe_downloaded_entity_token,
    );
  }
}

export interface VocoderUploadJobStateResponsePayload {
  success: boolean,
  state?: VocoderUploadJobState,
}

export interface VocoderUploadJobState {
  job_token: string,
  status: string,
  maybe_extra_status_description: string | null,
  attempt_count: number | undefined,
  maybe_downloaded_entity_type: string | undefined | null,
  maybe_downloaded_entity_token: string | undefined | null,
  created_at: string,
  updated_at: string,
}
