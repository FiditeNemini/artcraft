
abstract class AbstractPoller {

  private isCurrentlyPolling: boolean;
  private pollingIntervalMillis: number;

  constructor(pollingIntervalMillis: number) {
    this.isCurrentlyPolling = false;
    this.pollingIntervalMillis = pollingIntervalMillis;
  }

  // Polling action
  abstract performPollAction() : void;

  start() {
    this.isCurrentlyPolling = true;
    setTimeout(() => this.dispatchPoll(), this.pollingIntervalMillis);
  }

  stop() {
    this.isCurrentlyPolling = false;
  }

  isPolling() : boolean {
    return this.isCurrentlyPolling;
  }

  private dispatchPoll(): void {
    if (this.isPolling()) {
      this.performPollAction();
    }
    if (this.isPolling()) {
      setTimeout(() => this.dispatchPoll(), this.pollingIntervalMillis);
    }
  }
}

export { AbstractPoller }
