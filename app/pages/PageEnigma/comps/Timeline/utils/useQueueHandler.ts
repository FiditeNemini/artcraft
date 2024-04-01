import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useContext, useEffect } from "react";
import { currentTime } from "~/pages/PageEnigma/store";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import {
  QueueClip,
  QueueKeyframe,
  UpdateTime,
} from "~/pages/PageEnigma/models/track";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { toTimelineActions } from "~/pages/PageEnigma/Queue/toTimelineActions";

interface Arguments {
  action: fromEngineActions | toEngineActions | toTimelineActions;
  data: QueueClip | UpdateTime | QueueKeyframe;
}

export function useQueueHandler() {
  useSignals();
  const { addKeyframe } = useContext(TrackContext);

  const handleFromEngineActions = useCallback(({ action, data }: Arguments) => {
    console.log("FROM ENGINE", action, data);
    switch (action) {
      case fromEngineActions.UPDATE_TIME:
        currentTime.value = (data as UpdateTime).currentTime;
        break;
      default:
        throw new Error(`Unknown action ${action}`);
    }
  }, []);

  const handleToTimelineActions = useCallback(({ action, data }: Arguments) => {
    console.log("TO TIMELINE", action, data);
    switch (action) {
      case toTimelineActions.ADD_KEYFRAME:
        console.log(1);
        addKeyframe(data as QueueKeyframe, currentTime.value);
        break;
      default:
        throw new Error(`Unknown action ${action}`);
    }
  }, []);

  useEffect(() => {
    Queue.subscribe(QueueNames.FROM_ENGINE, handleFromEngineActions);
    Queue.subscribe(QueueNames.TO_TIMELINE, handleToTimelineActions);
  }, [handleFromEngineActions, handleToTimelineActions]);
}
