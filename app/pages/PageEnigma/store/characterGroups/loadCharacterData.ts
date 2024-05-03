import { ClipUI } from "~/pages/PageEnigma/datastructures/clips/clip_ui";
import {
  CharacterTrack,
  Clip,
  ClipType,
  Keyframe,
} from "~/pages/PageEnigma/models";
import { characterGroup } from "~/pages/PageEnigma/store";

function getAddCharacter(item: ClipUI) {
  const existingCharacter = characterGroup.value.characters.find(
    (character) => character.object_uuid === item.object_uuid,
  );

  if (existingCharacter) {
    return existingCharacter;
  }

  const newCharacter = {
    object_uuid: item.object_uuid,
    name: item.object_name,
    media_id: item.media_id,
    muted: false,
    minimized: false,
    animationClips: [],
    positionKeyframes: [],
    lipSyncClips: [],
    expressionClips: [],
  } as CharacterTrack;

  characterGroup.value = {
    ...characterGroup.value,
    characters: [
      ...characterGroup.value.characters.filter(
        (character) => character.object_uuid !== item.object_uuid,
      ),
      newCharacter,
    ].sort((charA, charB) => (charA.object_uuid < charB.object_uuid ? -1 : 1)),
  };

  return characterGroup.value.characters.find(
    (character) => character.object_uuid === item.object_uuid,
  ) as CharacterTrack;
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
