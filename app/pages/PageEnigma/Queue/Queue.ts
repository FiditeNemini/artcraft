import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import { QueueClip } from "~/pages/PageEnigma/models/track";
import { XYZ } from "../datastructures/common";
import { toTimelineActions } from "./toTimelineActions";

class Queue {
  private _queue: Record<
    string,
    {
      action: fromEngineActions | toEngineActions | toTimelineActions;
      data: QueueClip | { currentTime: number } | { position: XYZ, rotation: XYZ, scale: XYZ };
    }[]
  > = {};
  private _subscribers: Record<
    string,
    (entry: {
      action: fromEngineActions | toEngineActions | toTimelineActions;
      data: QueueClip | { currentTime: number } | { position: XYZ, rotation: XYZ, scale: XYZ };
    }) => void
  > = {};

  public publish({
    queueName,
    action,
    data,
  }: {
    queueName: string;
    action: fromEngineActions | toEngineActions | toTimelineActions ;
    data: QueueClip | { currentTime: number } | { position: XYZ, rotation: XYZ, scale: XYZ };
  }) {
    if (!this._queue[queueName]) {
      this._queue[queueName] = [];
    }
    this._queue[queueName].push({ action, data });
    console.log("Queued", queueName, action, data);

    if (this._subscribers[queueName]) {
      this._subscribers[queueName](this._queue[queueName].splice(0, 1)[0]);
    }
  }

  public subscribe(
    queueName: string,
    onMessage: (entry: {
      action: fromEngineActions | toEngineActions | toTimelineActions;
      data: QueueClip | { currentTime: number } | { position: XYZ, rotation: XYZ, scale: XYZ };
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
