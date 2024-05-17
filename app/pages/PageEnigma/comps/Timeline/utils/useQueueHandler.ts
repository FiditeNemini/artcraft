import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useContext, useEffect } from "react";
import {
  addNewCharacter,
  addObjectToTimeline,
  currentTime,
  loadAudioData,
  loadCameraData,
  loadCharacterData,
  loadObjectData,
  selectedObject,
} from "~/pages/PageEnigma/signals";
import Queue, { ToastDataType } from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import {
  MediaItem,
  QueueClip,
  QueueKeyframe,
  UpdateTime,
} from "~/pages/PageEnigma/models";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { addToast } from "~/signals";
import { ToastTypes } from "~/enums";
import { toTimelineActions } from "~/pages/PageEnigma/Queue/toTimelineActions";
import { ClipUI } from "~/pages/PageEnigma/datastructures/clips/clip_ui";
import { ClipGroup } from "~/pages/PageEnigma/enums";

interface Arguments {
  action: fromEngineActions | toEngineActions | toTimelineActions;
  data:
    | QueueClip
    | UpdateTime
    | QueueKeyframe
    | ClipUI[]
    | MediaItem
    | ToastDataType
    | null;
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
        case fromEngineActions.ADD_OBJECT: {
          // this could be an object or character
          addObjectToTimeline(data as MediaItem);
          break;
        }
        case fromEngineActions.DELETE_OBJECT:
          // this could be an object or character
          deleteObjectOrCharacter(data as MediaItem);
          break;
        case fromEngineActions.DESELECT_OBJECT:
          selectedObject.value = null;
          break;
        case fromEngineActions.RESET_TIMELINE:
          clearExistingData();
          break;
        case fromEngineActions.SELECT_OBJECT:
          selectedObject.value = {
            type: (data as MediaItem).type,
            id: (data as MediaItem).object_uuid ?? "",
          };
          break;
        case fromEngineActions.UPDATE_CHARACTER_ID:
          addNewCharacter(data as MediaItem);
          break;
        case fromEngineActions.UPDATE_TIME:
          currentTime.value = (data as UpdateTime).currentTime;
          break;
        case fromEngineActions.UPDATE_TIME_LINE:
          clearExistingData();
          (data as ClipUI[]).forEach((item) => {
            LOADING_FUNCTIONS[item.group](item);
          });
          break;
        case fromEngineActions.POP_A_TOAST: {
          const message = (data as ToastDataType).message;
          addToast(ToastTypes.ERROR, message);
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
