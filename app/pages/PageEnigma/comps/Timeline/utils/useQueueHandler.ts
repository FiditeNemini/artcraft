import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useContext, useEffect } from "react";
import {
  addNewCharacter,
  currentTime,
  loadAudioData,
  loadCameraData,
  loadCharacterData,
  loadObjectData,
} from "~/pages/PageEnigma/store";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import {
  ClipGroup,
  MediaItem,
  QueueClip,
  QueueKeyframe,
  UpdateTime,
} from "~/pages/PageEnigma/models";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { toTimelineActions } from "~/pages/PageEnigma/Queue/toTimelineActions";
import { ClipUI } from "~/pages/PageEnigma/datastructures/clips/clip_ui";

interface Arguments {
  action: fromEngineActions | toEngineActions | toTimelineActions;
  data: QueueClip | UpdateTime | QueueKeyframe | ClipUI[] | MediaItem;
}

const LOADING_FUNCTIONS: Record<ClipGroup, (item: ClipUI) => void> = {
  [ClipGroup.CHARACTER]: loadCharacterData,
  [ClipGroup.OBJECT]: loadObjectData,
  [ClipGroup.CAMERA]: loadCameraData,
  [ClipGroup.GLOBAL_AUDIO]: loadAudioData,
};

export function useQueueHandler() {
  useSignals();
  const { addKeyframe, clearExistingData, deleteObjectOrCharacter } =
    useContext(TrackContext);

  const handleFromEngineActions = useCallback(
    ({ action, data }: Arguments) => {
      console.log("FROM ENGINE", action, data);
      switch (action) {
        case fromEngineActions.UPDATE_TIME:
          currentTime.value = (data as UpdateTime).currentTime;
          break;
        case fromEngineActions.UPDATE_TIME_LINE:
          clearExistingData();
          (data as ClipUI[]).forEach((item) => {
            LOADING_FUNCTIONS[item.group](item);
          });
          break;
        case fromEngineActions.UPDATE_CHARACTER_ID: {
          addNewCharacter(data as MediaItem);
          break;
        }
        case fromEngineActions.DELETE_OBJECT: {
          // this could be an object or character
          deleteObjectOrCharacter(data as MediaItem);
          break;
        }
        default:
          throw new Error(`Unknown action ${action}`);
      }
    },
    [clearExistingData, deleteObjectOrCharacter],
  );

  const handleToTimelineActions = useCallback(
    ({ action, data }: Arguments) => {
      console.log("TO TIMELINE", action, data);
      switch (action) {
        case toTimelineActions.ADD_KEYFRAME:
          addKeyframe(data as QueueKeyframe, currentTime.value);
          break;
        default:
          throw new Error(`Unknown action ${action}`);
      }
    },
    [addKeyframe],
  );

  useEffect(() => {
    Queue.subscribe(QueueNames.FROM_ENGINE, handleFromEngineActions);
    Queue.subscribe(QueueNames.TO_TIMELINE, handleToTimelineActions);
  }, [handleFromEngineActions, handleToTimelineActions]);
}
