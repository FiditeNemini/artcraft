import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useContext, useEffect } from "react";
import { currentTime } from "~/pages/PageEnigma/store";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

interface Arguments {
  action: fromEngineActions | toEngineActions;
  data: any;
}

export function useQueueHandler() {
  useSignals();
  const { addObject } = useContext(TrackContext);

  const handleActions = useCallback(({ action, data }: Arguments) => {
    switch (action) {
      case fromEngineActions.FRAME_TICK:
        currentTime.value += 1;
        break;
      case fromEngineActions.OBJECT_ADDED:
        addObject(data);
        break;
      default:
        throw new Error(`Unknown action ${action}`);
    }
  }, []);

  useEffect(() => {
    Queue.subscribe(QueueNames.FROM_ENGINE, handleActions);
  }, [handleActions]);
}
