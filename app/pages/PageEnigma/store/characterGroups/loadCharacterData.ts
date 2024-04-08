import { ClipUI } from "~/pages/PageEnigma/datastructures/clips/clip_ui";
import {
  CharacterGroup,
  Clip,
  ClipType,
  Keyframe,
} from "~/pages/PageEnigma/models";
import { characterGroups } from "~/pages/PageEnigma/store";

function getAddCharacter(item: ClipUI) {
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

export function loadCharacterData(item: ClipUI) {
  const existingCharacter = getAddCharacter(item);
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
    existingCharacter.animationClips.sort(
      (clipA, clipB) => clipA.offset - clipB.offset,
    );
  }
  if (item.type === ClipType.TRANSFORM) {
    const newKeyframe = {
      version: item.version,
      keyframe_uuid: item.clip_uuid,
      group: item.group,
      object_uuid: item.object_uuid,
      offset: item.keyframe_offset,
    } as Keyframe;
    existingCharacter.positionKeyframes.push(newKeyframe);
    existingCharacter.positionKeyframes.sort(
      (keyframeA, keyframeB) => keyframeA.offset - keyframeB.offset,
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
    existingCharacter.lipSyncClips.sort(
      (clipA, clipB) => clipA.offset - clipB.offset,
    );
  }
}
