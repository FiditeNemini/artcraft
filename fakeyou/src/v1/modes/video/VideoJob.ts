// Job states
enum VideoJobStatus {
  Pending,
  Started,
  Failed,
  Completed,
}

function parseVideoJobStatus(status: string) : VideoJobStatus | undefined {
  switch (status.toLowerCase()) {
    case "pending":
      return VideoJobStatus.Pending;
    case "started":
      return VideoJobStatus.Started;
    case "failed":
      return VideoJobStatus.Failed;
    case "completed":
      return VideoJobStatus.Completed;
    default:
      return undefined;
  }
}

// Immutable jobs
class VideoJob {
  readonly uuid: string;
  readonly jobStatus: VideoJobStatus;

  constructor(uuid: string, jobStatus: VideoJobStatus) {
    this.uuid = uuid;
    this.jobStatus = jobStatus;
  }

  getStatusUrl(): string {
    return `https://grumble.works/job/${this.uuid}`;
  }

  getVideoDownloadUrl(): string {
    return `https://storage.googleapis.com/vocodes-audio-uploads/uploads/${this.uuid}/output.mp4`;
  }

  toBuilder(): VideoJobBuilder {
    return new VideoJobBuilder(this.uuid, this.jobStatus);
  }
}

// Job builder
class VideoJobBuilder {
  uuid: string;
  jobStatus: VideoJobStatus;

  constructor(uuid: string, jobStatus: VideoJobStatus) {
    this.uuid = uuid;
    this.jobStatus = jobStatus;
  }

  build(): VideoJob {
    return new VideoJob(this.uuid, this.jobStatus);
  }
}

export { VideoJob, VideoJobBuilder, VideoJobStatus, parseVideoJobStatus }
