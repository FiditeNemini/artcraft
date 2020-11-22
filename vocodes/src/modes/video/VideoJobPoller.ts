import { AbstractPoller } from "../../poller/AbstractPoller";
import { VideoJob, VideoJobStatus, parseVideoJobStatus } from "./VideoJob";

class VideoJobPoller extends AbstractPoller {

  currentVideoJob?: VideoJob;
  updateVideoJobCallback: (videoJob: VideoJob) => void;

  constructor(updateVideoJobCallback: (videoJob: VideoJob) => void) {
    super(2000);
    this.updateVideoJobCallback = updateVideoJobCallback;
  }

  setCurrentVideoJob(currentVideoJob: VideoJob) {
    this.currentVideoJob = currentVideoJob;
  }

  clearCurrentVideoJob() {
    this.currentVideoJob = undefined;
  }

  performPollAction(): void {
    if (this.currentVideoJob === undefined) {
      console.log('No current job to poll');
      return;
    }

    const videoJob = this.currentVideoJob!;
    const url = videoJob.getStatusUrl();

    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);

          if (videoJob.uuid !== result.uuid) {
            console.warn("video uuid does not match");
            return;
          }

          if (result.job_status === undefined) {
            return;
          }

          let status = parseVideoJobStatus(result.job_status);
          let builder = videoJob.toBuilder();

          if (status !== undefined && status !== builder.jobStatus) {
            console.log('New status', status);
            builder.jobStatus = status;
            this.updateVideoJobCallback(builder.build());
          }
        }
      );
  }
}

export { VideoJobPoller }