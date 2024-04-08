import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import {
  QueueClip,
  QueueKeyframe,
  UpdateTime,
} from "~/pages/PageEnigma/models";
import { toTimelineActions } from "./toTimelineActions";
import { ClipUI } from "../datastructures/clips/clip_ui";
class Queue {
  private _queue: Record<
    string,
    {
      action: fromEngineActions | toEngineActions | toTimelineActions;
      data: QueueClip | UpdateTime | QueueKeyframe | ClipUI[];
    }[]
  > = {};
  private _subscribers: Record<
    string,
    (entry: {
      action: fromEngineActions | toEngineActions | toTimelineActions;
      data: QueueClip | UpdateTime | QueueKeyframe | ClipUI[];
    }) => void
  > = {};

  public publish({
    queueName,
    action,
    data,
  }: {
    queueName: string;
    action: fromEngineActions | toEngineActions | toTimelineActions;
    data: QueueClip | UpdateTime | QueueKeyframe | ClipUI[] ;
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
      data: QueueClip | UpdateTime | QueueKeyframe | ClipUI[];
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
