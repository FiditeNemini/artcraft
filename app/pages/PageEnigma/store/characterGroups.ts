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

export const characterGroups = signal<CharacterGroup[]>([
  {
    id: "CH1",
    muted: false,
    animationClips: [],
    positionKeyframes: [],
    lipSyncClips: [],
  },
]);

export function updateCharacters({
  type,
  id,
  offset,
  length,
}: {
  type: ClipType;
  id: string;
  length?: number;
  offset: number;
}) {
  const oldCharacterGroups = characterGroups.value;
  if (type === ClipType.ANIMATION) {
    characterGroups.value = oldCharacterGroups.map((character) => {
      const newAnimationClips = [...character.animationClips];
      const clipIndex = newAnimationClips.findIndex(
        (row) => row.clip_uuid === id,
      );
      if (clipIndex === -1) {
        return { ...character };
      }
      const clip = newAnimationClips[clipIndex];
      clip.offset = offset;
      clip.length = length!;

      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.UPDATE_CLIP,
        data: clip,
      });

      return {
        ...character,
        animationClips: newAnimationClips,
      };
    });
  }

  if (type === ClipType.TRANSFORM) {
    characterGroups.value = oldCharacterGroups.map((character) => {
      const newPositionKeyframes = [...character.positionKeyframes];
      const keyframeIndex = newPositionKeyframes.findIndex(
        (row) => row.keyframe_uuid === id,
      );
      if (keyframeIndex === -1) {
        return { ...character };
      }
      const keyframe = newPositionKeyframes[keyframeIndex];
      keyframe.offset = offset;

      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.UPDATE_CLIP,
        data: keyframe,
      });

      return {
        ...character,
        positionKeyframes: newPositionKeyframes,
      };
    });
  }
  if (type === ClipType.AUDIO) {
    characterGroups.value = oldCharacterGroups.map((character) => {
      const newLipSyncClips = [...character.lipSyncClips];
      const clipIndex = newLipSyncClips.findIndex(
        (row) => row.clip_uuid === id,
      );
      if (clipIndex === -1) {
        return { ...character };
      }
      const clip = newLipSyncClips[clipIndex];
      clip.offset = offset;
      clip.length = length!;

      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.UPDATE_CLIP,
        data: clip,
      });

      return {
        ...character,
        lipSyncClips: newLipSyncClips,
      };
    });
  }
}

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

  const oldCharacterGroups = characterGroups.value;
  characterGroups.value = oldCharacterGroups.map((character) => {
    if (character.id !== characterId) {
      return { ...character };
    }
    return {
      ...character,
      animationClips: [...character.animationClips, newClip].sort(
        (clipA, clipB) => clipA.offset - clipB.offset,
      ),
    };
  });

  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: toEngineActions.ADD_CLIP,
    data: newClip,
  });
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

  const oldCharacterGroups = characterGroups.value;
  characterGroups.value = oldCharacterGroups.map((character) => {
    if (character.id !== characterId) {
      return { ...character };
    }
    return {
      ...character,
      lipSyncClips: [...character.lipSyncClips, newClip].sort(
        (clipA, clipB) => clipA.offset - clipB.offset,
      ),
    };
  });

  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: toEngineActions.ADD_CLIP,
    data: newClip,
  });
}

export function addCharacterKeyframe(keyframe: QueueKeyframe, offset: number) {
  const oldCharacterGroups = characterGroups.value;

  if (
    oldCharacterGroups.some((characterGroup) => {
      return characterGroup.positionKeyframes.some(
        (row) => row.offset === offset,
      );
    })
  ) {
    return;
  }

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

  characterGroups.value = oldCharacterGroups.map((character) => {
    if (character.id !== keyframe.object_uuid) {
      return { ...character };
    }
    return {
      ...character,
      positionKeyframes: [...character.positionKeyframes, newKeyframe].sort(
        (keyFrameA, keyframeB) => keyFrameA.offset - keyframeB.offset,
      ),
    };
  });

  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: toEngineActions.ADD_KEYFRAME,
    data: newKeyframe,
  });
}

export function toggleLipSyncMute(characterId: string) {
  const oldCharacterGroups = characterGroups.value;
  characterGroups.value = oldCharacterGroups.map((character) => {
    if (character.id === characterId) {
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
      muted: character.id === characterId ? !character.muted : character.muted,
    };
  });
}

export function selectCharacterClip(clipId: string) {
  const oldCharacterGroups = characterGroups.value;
  characterGroups.value = oldCharacterGroups.map((character) => ({
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
  }));
}

export function deleteCharacterClip(clip: Clip) {
  const oldCharacterGroups = characterGroups.value;
  characterGroups.value = oldCharacterGroups.map((character) => ({
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
  }));
}

export function deleteCharacterKeyframe(keyframe: Keyframe) {
  const oldCharacterGroups = characterGroups.value;
  characterGroups.value = oldCharacterGroups.map((character) => ({
    ...character,
    positionClips: character.positionKeyframes.filter((row) => {
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
  }));
}

// probably not to much to send imo
export function addCharacter(character:MediaItem) {
  //{"version":1,"media_id":"m_r7w1tmkx2jg8nznr3hyzj4k6zhfh7d ",
  // "type":"character","name":"Female Doll",
  // "thumbnail":"resources/characters/img03.png"}
  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: toEngineActions.ADD_CHARACTER,
    data: character,
  });
}
export function addObject(object:MediaItem) {
   //{"version":1,"media_id":"m_r7w1tmkx2jg8nznr3hyzj4k6zhfh7d ",
  // "type":"character","name":"Female Doll",
  // "thumbnail":"resources/characters/img03.png"}
  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: toEngineActions.ADD_OBJECT,
    data: object,
  });
}