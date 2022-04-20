
abstract class AbstractPoller {

  private isCurrentlyPolling: boolean;
  private pollingIntervalMillis: number;
  private timeoutRef?: ReturnType<typeof setTimeout>;

  constructor(pollingIntervalMillis: number) {
    this.isCurrentlyPolling = false;
    this.pollingIntervalMillis = pollingIntervalMillis;
  }

  // Polling action
  abstract performPollAction() : void;

  start() {
    if (this.isPolling()) return;
    this.isCurrentlyPolling = true;
    this.timeoutRef = setTimeout(() => this.dispatchPoll(), this.pollingIntervalMillis);
  }

  stop() {
    this.isCurrentlyPolling = false;
    if (this.timeoutRef !== undefined) {
      clearTimeout(this.timeoutRef);
    }
  }

  isPolling() : boolean {
    return this.isCurrentlyPolling;
  }

  private dispatchPoll(): void {
    if (!this.isPolling()) return;
    this.performPollAction();

    if (!this.isPolling()) return;
    this.timeoutRef = setTimeout(() => this.dispatchPoll(), this.pollingIntervalMillis);
  }
}

export { AbstractPoller }
