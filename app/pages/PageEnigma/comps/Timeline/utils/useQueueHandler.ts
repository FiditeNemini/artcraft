import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useContext, useEffect } from "react";
import {
  addCharacterAnimation,
  addCharacterKeyframe,
  characterGroups,
  currentTime,
} from "~/pages/PageEnigma/store";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import {
  AssetType,
  CharacterGroup,
  ClipGroup,
  ClipType,
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
  data: QueueClip | UpdateTime | QueueKeyframe | ClipUI[];
}

function addCharacter(item: ClipUI) {
  const existingCharacter = characterGroups.value.find(
    (character) => character.id === item.object_uuid,
  );

  if (existingCharacter) {
    return;
  }

  const newCharacter = {
    id: item.object_uuid,
    name: item.object_name,
    muted: false,
    animationClips: [],
    positionKeyframes: [],
    lipSyncClips: [],
  } as CharacterGroup;

  characterGroups.value = [
    ...characterGroups.value.filter(
      (character) => character.id !== item.object_uuid,
    ),
    newCharacter,
  ].sort((charA, charB) => (charA.id < charB.id ? -1 : 1));
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
      case fromEngineActions.UPDATE_TIME_LINE:
        console.log(data);
        (data as ClipUI[]).forEach((item) => {
          addCharacter(item);
          if (item.group === ClipGroup.CHARACTER) {
            if (item.type === ClipType.ANIMATION) {
              const newItem = {
                version: item.version,
                type: item.type as string as AssetType,
                group: item.group,
                object_uuid: item.object_uuid,
                media_id: item.media_id,
                name: item.name,
                length: item.length,
              } as MediaItem;
              addCharacterAnimation({
                dragItem: newItem,
                characterId: item.object_uuid,
                offset: item.offset,
              });
            }
            if (item.type === ClipType.TRANSFORM) {
              // newItem.length = item.length;
              // addCharacterKeyframe({
              //   dragItem: newItem,
              //   characterId: item.object_uuid,
              //   offset: item.offset,
              // });
            }
          }
        });
        break;
      case fromEngineActions.UPDATE_CHARACTER_ID:
        console.log(action);
        break;
      default:
        throw new Error(`Unknown action ${action}`);
    }
  }, []);

  const handleToTimelineActions = useCallback(({ action, data }: Arguments) => {
    console.log("TO TIMELINE", action, data);
    switch (action) {
      case toTimelineActions.ADD_KEYFRAME:
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
