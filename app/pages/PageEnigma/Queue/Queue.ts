import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

class Queue {
  private _queue: Record<
    string,
    { action: fromEngineActions | toEngineActions; data: any }[]
  > = {};
  private _subscribers: Record<
    string,
    (entry: { action: fromEngineActions | toEngineActions; data: any }) => void
  > = {};

  public publish({
    queueName,
    action,
    data,
  }: {
    queueName: string;
    action: fromEngineActions | toEngineActions;
    data: any;
  }) {
    if (!this._queue[queueName]) {
      this._queue[queueName] = [];
    }
    this._queue[queueName].push({ action, data });

    if (this._subscribers[queueName]) {
      this._subscribers[queueName](this._queue[queueName].splice(0, 1)[0]);
    }
  }

  public subscribe(
    queueName: string,
    onMessage: (entry: {
      action: fromEngineActions | toEngineActions;
      data: any;
    }) => void,
  ) {
    this._subscribers[queueName] = onMessage;
    while (this._queue[queueName]?.length) {
      this._subscribers[queueName](this._queue[queueName].splice(0, 1)[0]);
    }
  }
}

const queue = new Queue();

export default queue;
