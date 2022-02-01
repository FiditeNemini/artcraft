import { AbstractPoller } from "../../poller/AbstractPoller";
import { VideoQueueStats } from "./VideoQueueStats";


class VideoQueuePoller extends AbstractPoller {

  updateCallback: (stats: VideoQueueStats) => void;

  constructor(updateCallback: (stats: VideoQueueStats) => void) {
    super(5000);
    this.updateCallback = updateCallback;
  }

  performPollAction(): void {
    fetch("https://grumble.works/job")
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
          let videoQueueStats = VideoQueueStats.fromJson(result);
          this.updateCallback(videoQueueStats);
        }
      );
  }
}

export { VideoQueuePoller }