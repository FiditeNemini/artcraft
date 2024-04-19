import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

import {
  QueueClip,
  QueueKeyframe,
  UpdateTime,
  MediaItem,
} from "~/pages/PageEnigma/models";
import { toTimelineActions } from "./toTimelineActions";

type UnionedActionTypes =
  | fromEngineActions
  | toEngineActions
  | toTimelineActions;
type UnionedDataTypes =
  | QueueClip
  | UpdateTime
  | QueueKeyframe
  | ClipUI[]
  | MediaItem
  | null;

export type QueueSubscribeType = {
  action: UnionedActionTypes;
  data: UnionedDataTypes;
};
import { ClipUI } from "../datastructures/clips/clip_ui";
class Queue {
  private _queue: Record<
    string,
    {
      action: UnionedActionTypes;
      data: UnionedDataTypes;
    }[]
  > = {};
  private _subscribers: Record<
    string,
    (entry: { action: UnionedActionTypes; data: UnionedDataTypes }) => void
  > = {};

  public publish({
    queueName,
    action,
    data,
  }: {
    queueName: string;
    action: UnionedActionTypes;
    data: UnionedDataTypes;
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
    onMessage: (entry: QueueSubscribeType) => void,
  ) {
    this._subscribers[queueName] = onMessage;
    while (this._queue[queueName]?.length) {
      this._subscribers[queueName](this._queue[queueName].splice(0, 1)[0]);
    }
  }
}

const queue = new Queue();

export default queue;
