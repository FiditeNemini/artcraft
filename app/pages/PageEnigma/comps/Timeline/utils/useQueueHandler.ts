import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useEffect } from "react";
import { currentTime } from "~/pages/PageEnigma/store";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import { QueueClip } from "~/pages/PageEnigma/models/track";

interface UpdateTime {
  currentTime: number;
}

interface Arguments {
  action: fromEngineActions | toEngineActions;
  data: QueueClip | UpdateTime;
}

export function useQueueHandler() {
  useSignals();
  const handleActions = useCallback(({ action, data }: Arguments) => {
    switch (action) {
      case fromEngineActions.UPDATE_TIME:
        currentTime.value = (data as UpdateTime).currentTime;
        break;
      default:
        throw new Error(`Unknown action ${action}`);
    }
  }, []);

  useEffect(() => {
    Queue.subscribe(QueueNames.FROM_ENGINE, handleActions);
  }, [handleActions]);
}
