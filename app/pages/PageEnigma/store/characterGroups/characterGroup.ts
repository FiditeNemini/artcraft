import {
  CharacterGroup,
  Clip,
  ClipGroup,
  ClipType,
  Keyframe,
  MediaItem,
  QueueKeyframe,
} from "~/pages/PageEnigma/models";
import { signal } from "@preact/signals-core";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import * as uuid from "uuid";
import { AddToast, ToastTypes } from "~/contexts/ToasterContext";

export const characterGroup = signal<CharacterGroup>({
  id: "CG1",
  characters: [],
});

export function addCharacterAnimation({
  dragItem,
  characterId,
  offset,
}: {
  dragItem: MediaItem;
  characterId: string;
  offset: number;
}) {
  const clip_uuid = uuid.v4();
  const newClip = {
    version: 1,
    media_id: dragItem.media_id,
    group: ClipGroup.CHARACTER,
    type: ClipType.ANIMATION,
    offset,
    length: dragItem.length,
    clip_uuid,
    name: dragItem.name,
    object_uuid: characterId,
  } as Clip;

  const oldCharacterGroup = characterGroup.value;
  characterGroup.value = {
    ...oldCharacterGroup,
    characters: oldCharacterGroup.characters.map((character) => {
      if (character.object_uuid !== characterId) {
        return { ...character };
      }

      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.ADD_CLIP,
        data: newClip,
      });

      return {
        ...character,
        animationClips: [...character.animationClips, newClip].sort(
          (clipA, clipB) => clipA.offset - clipB.offset,
        ),
      };
    }),
  };
}

export function addCharacterAudio({
  dragItem,
  characterId,
  offset,
}: {
  dragItem: MediaItem;
  characterId: string;
  offset: number;
}) {
  const clip_uuid = uuid.v4();
  const newClip = {
    version: 1,
    media_id: dragItem.media_id,
    group: ClipGroup.CHARACTER,
    type: ClipType.AUDIO,
    offset,
    length: dragItem.length,
    clip_uuid,
    object_uuid: characterId,
    name: dragItem.name,
  } as Clip;

  const oldCharacterGroup = characterGroup.value;
  characterGroup.value = {
    ...oldCharacterGroup,
    characters: oldCharacterGroup.characters.map((character) => {
      if (character.object_uuid !== characterId) {
        return { ...character };
      }

      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.ADD_CLIP,
        data: newClip,
      });

      return {
        ...character,
        lipSyncClips: [...character.lipSyncClips, newClip].sort(
          (clipA, clipB) => clipA.offset - clipB.offset,
        ),
      };
    }),
  };
}

export function addCharacterKeyframe(
  keyframe: QueueKeyframe,
  offset: number,
  addToast: AddToast,
) {
  const oldCharacterGroup = characterGroup.value;

  const newKeyframe = {
    version: keyframe.version,
    keyframe_uuid: uuid.v4(),
    group: keyframe.group,
    object_uuid: keyframe.object_uuid,
    offset,
    position: keyframe.position,
    rotation: keyframe.rotation,
    scale: keyframe.scale,
    selected: false,
  } as Keyframe;

  // check to see if there is an existing keyframe at this offset for this character
  // if so, update the existing item, instead of adding a new one
  const keyframeAtOffset = oldCharacterGroup.characters.reduce(
    (foundKeyframe, characterTrack) => {
      if (foundKeyframe) {
        return foundKeyframe;
      }
      if (characterTrack.object_uuid !== keyframe.object_uuid) {
        return;
      }
      return characterTrack.positionKeyframes.find(
        (row) => row.offset === offset,
      );
    },
    undefined as Keyframe | undefined,
  );

  if (keyframeAtOffset) {
    addToast(
      ToastTypes.WARNING,
      "Keyframe at this location has been overridden.",
    );
    newKeyframe.keyframe_uuid = keyframeAtOffset.keyframe_uuid;
  }

  characterGroup.value = {
    ...oldCharacterGroup,
    characters: oldCharacterGroup.characters.map((character) => {
      if (character.object_uuid !== keyframe.object_uuid) {
        return { ...character };
      }

      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: keyframeAtOffset
          ? toEngineActions.UPDATE_KEYFRAME
          : toEngineActions.ADD_KEYFRAME,
        data: newKeyframe,
      });

      return {
        ...character,
        positionKeyframes: [
          ...character.positionKeyframes.filter(
            (keyframe) =>
              keyframe.keyframe_uuid !== keyframeAtOffset?.keyframe_uuid,
          ),
          newKeyframe,
        ].sort((clipA, clipB) => clipA.offset - clipB.offset),
      };
    }),
  };
}

export function toggleLipSyncMute(characterId: string) {
  const oldCharacterGroup = characterGroup.value;
  characterGroup.value = {
    ...oldCharacterGroup,
    characters: oldCharacterGroup.characters.map((character) => {
      if (character.object_uuid === characterId) {
        Queue.publish({
          queueName: QueueNames.TO_ENGINE,
          action: character?.muted
            ? toEngineActions.UNMUTE
            : toEngineActions.MUTE,
          data: {
            version: 1,
            type: ClipType.AUDIO,
            group: ClipGroup.CHARACTER,
            object_uuid: characterId,
          },
        });
      }

      return {
        ...character,
        muted:
          character.object_uuid === characterId
            ? !character.muted
            : character.muted,
      };
    }),
  };
}

export function toggleCharacterMinimized(characterId: string) {
  const oldCharacterGroup = characterGroup.value;
  characterGroup.value = {
    ...oldCharacterGroup,
    characters: oldCharacterGroup.characters.map((character) => {
      return {
        ...character,
        minimized:
          character.object_uuid === characterId
            ? !character.minimized
            : character.minimized,
      };
    }),
  };
}

export function selectCharacterClip(clipId: string) {
  const oldCharacterGroup = characterGroup.value;
  characterGroup.value = {
    ...oldCharacterGroup,
    characters: oldCharacterGroup.characters.map((character) => ({
      ...character,
      animationClips: character.animationClips.map((clip) => ({
        ...clip,
        selected: clip.clip_uuid === clipId ? !clip.selected : clip.selected,
      })),
      positionClips: character.positionKeyframes.map((keyframe) => ({
        ...keyframe,
        selected:
          keyframe.keyframe_uuid === clipId
            ? !keyframe.selected
            : keyframe.selected,
      })),
      lipSyncClips: character.lipSyncClips.map((clip) => ({
        ...clip,
        selected: clip.clip_uuid === clipId ? !clip.selected : clip.selected,
      })),
    })),
  };
}

export function deleteCharacterClip(clip: Clip) {
  const oldCharacterGroup = characterGroup.value;
  characterGroup.value = {
    ...oldCharacterGroup,
    characters: oldCharacterGroup.characters.map((character) => ({
      ...character,
      animationClips: character.animationClips.filter((row) => {
        if (row.clip_uuid === clip.clip_uuid) {
          Queue.publish({
            queueName: QueueNames.TO_ENGINE,
            action: toEngineActions.DELETE_CLIP,
            data: row,
          });
          return false;
        }
        return true;
      }),
      lipSyncClips: character.lipSyncClips.filter((row) => {
        if (row.clip_uuid === clip.clip_uuid) {
          Queue.publish({
            queueName: QueueNames.TO_ENGINE,
            action: toEngineActions.DELETE_CLIP,
            data: row,
          });
          return false;
        }
        return true;
      }),
    })),
  };
}

export function deleteCharacterKeyframe(keyframe: Keyframe) {
  const oldCharacterGroup = characterGroup.value;
  characterGroup.value = {
    ...oldCharacterGroup,
    characters: oldCharacterGroup.characters.map((character) => ({
      ...character,
      positionKeyframes: character.positionKeyframes.filter((row) => {
        if (row.keyframe_uuid === keyframe.keyframe_uuid) {
          Queue.publish({
            queueName: QueueNames.TO_ENGINE,
            action: toEngineActions.DELETE_KEYFRAME,
            data: row,
          });
          return false;
        }
        return true;
      }),
    })),
  };
}
