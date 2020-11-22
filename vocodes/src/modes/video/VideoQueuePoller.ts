import { AbstractPoller } from "../../poller/AbstractPoller";

class VideoQueuePoller extends AbstractPoller {

  constructor() {
    super(5000);
  }

  performPollAction(): void {
    fetch("https://grumble.works/job")
      .then(res => res.json())
      .then(
        (result) => {
          console.log(result);
        }
      );
  }
}

export { VideoQueuePoller }