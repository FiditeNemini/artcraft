import { fromEngineActions } from "~/pages/PageEnigma/Queue/fromEngineActions";
import { useSignals } from "@preact/signals-react/runtime";
import { useCallback, useContext, useEffect } from "react";
import { characterGroups, currentTime } from "~/pages/PageEnigma/store";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import {
  CharacterGroup,
  Clip,
  ClipGroup,
  ClipType,
  Keyframe,
  MediaItem,
  QueueClip,
  QueueKeyframe,
  UpdateTime,
} from "~/pages/PageEnigma/models";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { toTimelineActions } from "~/pages/PageEnigma/Queue/toTimelineActions";
import { ClipUI } from "~/pages/PageEnigma/datastructures/clips/clip_ui";
import * as uuid from "uuid";

interface Arguments {
  action: fromEngineActions | toEngineActions | toTimelineActions;
  data: QueueClip | UpdateTime | QueueKeyframe | ClipUI[] | MediaItem;
}

function addCharacter(item: ClipUI) {
  const existingCharacter = characterGroups.value.find(
    (character) => character.id === item.object_uuid,
  );

  if (existingCharacter) {
    return existingCharacter;
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

  return characterGroups.value.find(
    (character) => character.id === item.object_uuid,
  ) as CharacterGroup;
}

function addObject(item: ClipUI) {
  const existingCharacter = characterGroups.value.find(
    (character) => character.id === item.object_uuid,
  );

  if (existingCharacter) {
    return existingCharacter;
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

  return characterGroups.value.find(
    (character) => character.id === item.object_uuid,
  ) as CharacterGroup;
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
          if (item.group === ClipGroup.CHARACTER) {
            const existingCharacter = addCharacter(item);
            if (item.type === ClipType.ANIMATION) {
              const newItem = {
                version: item.version,
                clip_uuid: item.clip_uuid,
                type: item.type,
                group: item.group,
                object_uuid: item.object_uuid,
                media_id: item.media_id,
                name: item.name,
                offset: item.offset,
                length: item.length,
              } as Clip;
              existingCharacter.animationClips.push(newItem);
              existingCharacter.animationClips.sort((clipA, clipB) =>
                clipA.clip_uuid < clipB.clip_uuid ? -1 : 1,
              );
            }
            if (item.type === ClipType.TRANSFORM) {
              const newKeyframe = {
                version: item.version,
                keyframe_uuid: item.clip_uuid,
                group: item.group,
                object_uuid: item.object_uuid,
                offset: item.offset,
              } as Keyframe;
              existingCharacter.positionKeyframes.push(newKeyframe);
              existingCharacter.positionKeyframes.sort(
                (keyframeA, keyframeB) =>
                  keyframeA.keyframe_uuid < keyframeB.keyframe_uuid ? -1 : 1,
              );
            }
            if (item.type === ClipType.AUDIO) {
              const newItem = {
                version: item.version,
                clip_uuid: item.clip_uuid,
                type: item.type,
                group: item.group,
                object_uuid: item.object_uuid,
                media_id: item.media_id,
                name: item.name,
                offset: item.offset,
                length: item.length,
              } as Clip;
              existingCharacter.lipSyncClips.push(newItem);
              existingCharacter.lipSyncClips.sort((clipA, clipB) =>
                clipA.clip_uuid < clipB.clip_uuid ? -1 : 1,
              );
            }
          }
          if (item.group === ClipGroup.OBJECT) {
            const existingObject = addObject(item);
            if (item.type === ClipType.ANIMATION) {
              const newItem = {
                version: item.version,
                clip_uuid: item.clip_uuid,
                type: item.type,
                group: item.group,
                object_uuid: item.object_uuid,
                media_id: item.media_id,
                name: item.name,
                offset: item.offset,
                length: item.length,
              } as Clip;
              existingObject.clips.push(newItem);
              existingObject.clips.sort((clipA, clipB) =>
                clipA.clip_uuid < clipB.clip_uuid ? -1 : 1,
              );
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
