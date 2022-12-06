import { BucketConfig } from "@storyteller/components/src/api/BucketConfig";
import { GetTtsInferenceJobStatus, GetTtsInferenceJobStatusIsOk, TtsInferenceJobStatus } from "@storyteller/components/src/api/jobs/GetTtsInferenceJobStatus";
import { JobState, jobStateCanChange, jobStateFromString } from "@storyteller/components/src/jobs/JobStates";
import { TtsInferenceJob } from "@storyteller/components/src/jobs/TtsInferenceJobs";
import PlayableAudioFile from "./PlayableAudioFile";

enum PollingOutcome {
  KeepPolling,
  RemoveFromPendingQueue,
}

class MediaQueue {

  // These are newly enqueued TTS jobs.
  private enqueuedJobQueue: TtsInferenceJob[];

  // This is audio that is ready to play!
  private readyToPlayAudioQueue: PlayableAudioFile[];

  constructor() {
    this.enqueuedJobQueue = [];
    this.readyToPlayAudioQueue = [];
  }

  // Add a new TTS job
  addNewTtsJobToken(jobToken: string) {
    const newJob = new TtsInferenceJob(jobToken);
    this.enqueuedJobQueue.push(newJob);
  }

  // Get the next audio file that is available (if it exists)
  getNextAvailable() : PlayableAudioFile | undefined {
    return this.readyToPlayAudioQueue.shift();
  }

  // Query all jobs *ONCE*
  async queryAllPendingJobs() {
    let removeJobTokens = new Set();

    for (let job of this.enqueuedJobQueue) {
      if (jobStateCanChange(job.jobState)) {
        let pollingOutcome = await this.queryPendingJobForStatus(job.jobToken);

        if (pollingOutcome === PollingOutcome.RemoveFromPendingQueue) {
          removeJobTokens.add(job.jobToken);
        }
      }
    }

    this.enqueuedJobQueue = 
        this.enqueuedJobQueue.filter(job => !removeJobTokens.has(job.jobToken));
  }

  private async queryPendingJobForStatus(jobToken: string) : Promise<PollingOutcome> {
    const response = await GetTtsInferenceJobStatus(jobToken);
    if (GetTtsInferenceJobStatusIsOk(response)) {

      const jobState = jobStateFromString(response.state.status);
      
      switch (jobState) {
        case JobState.UNKNOWN:
        case JobState.PENDING:
        case JobState.STARTED:
        case JobState.ATTEMPT_FAILED:
          return PollingOutcome.KeepPolling;

        case JobState.COMPLETE_SUCCESS:
          this.addReadyToPlayJob(response.state);
          return PollingOutcome.RemoveFromPendingQueue;

        case JobState.COMPLETE_FAILURE:
        case JobState.DEAD:
          return PollingOutcome.RemoveFromPendingQueue;
      }
    }

    return PollingOutcome.KeepPolling;
  }

  private addReadyToPlayJob(jobStatusResponse: TtsInferenceJobStatus) {
    const wavPath = jobStatusResponse.maybe_public_bucket_wav_audio_path;

    if (!wavPath) {
      return;
    }

    const wavUrl = new BucketConfig().getGcsUrl(wavPath);
    const playable = new PlayableAudioFile(wavUrl);

    this.readyToPlayAudioQueue.push(playable);
  }
}

export default MediaQueue;
