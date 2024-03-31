import { useCallback, useState } from "react";
import {
  Clip,
  CharacterGroup,
  ClipGroup,
  ClipType,
  MediaClip,
  QueueKeyframe,
  Keyframe,
} from "~/pages/PageEnigma/models/track";
import * as uuid from "uuid";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

export default function useUpdateCharacters() {
  const [characters, setCharacters] = useState<CharacterGroup[]>([
    {
      id: "CH1",
      muted: false,
      animationClips: [],
      positionKeyframes: [],
      lipSyncClips: [],
    },
  ]);

  const updateCharacters = useCallback(
    ({
      type,
      id,
      offset,
      length,
    }: {
      type: "animations" | "positions" | "lipSync";
      id: string;
      length: number;
      offset: number;
    }) => {
      if (type === "animations") {
        setCharacters((oldCharacters) => {
          return oldCharacters.map((character) => {
            const newAnimationClips = [...character.animationClips];
            const clipIndex = newAnimationClips.findIndex(
              (row) => row.clip_uuid === id,
            );
            if (clipIndex === -1) {
              return { ...character };
            }
            const clip = newAnimationClips[clipIndex];
            clip.offset = offset;
            clip.length = length;

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
        });
        return;
      }

      if (type === "positions") {
        setCharacters((oldCharacters) => {
          return oldCharacters.map((character) => {
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
              positionClips: newPositionKeyframes,
            };
          });
        });
        return;
      }
      if (type === "lipSync") {
        setCharacters((oldCharacters) => {
          return oldCharacters.map((character) => {
            const newLipSyncClips = [...character.lipSyncClips];
            const clipIndex = newLipSyncClips.findIndex(
              (row) => row.clip_uuid === id,
            );
            if (clipIndex === -1) {
              return { ...character };
            }
            const clip = newLipSyncClips[clipIndex];
            clip.offset = offset;
            clip.length = length;

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
        });
      }
    },
    [],
  );

  const addCharacterAnimation = useCallback(
    ({
      clipId,
      characterId,
      animationClips,
      offset,
    }: {
      clipId: string;
      characterId: string;
      animationClips: MediaClip[];
      offset: number;
    }) => {
      const clip = animationClips.find((row) => row.media_id === clipId);
      if (!clip) {
        return;
      }

      const clip_uuid = uuid.v4();
      const newClip = {
        ...clip,
        group: ClipGroup.CHARACTER,
        offset,
        clip_uuid,
        object_uuid: characterId,
      } as Clip;

      setCharacters((oldCharacters) => {
        return oldCharacters.map((character) => {
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
      });

      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.ADD_CLIP,
        data: newClip,
      });
    },
    [],
  );

  const addCharacterAudio = useCallback(
    ({
      clipId,
      characterId,
      audioClips,
      offset,
    }: {
      clipId: string;
      characterId: string;
      audioClips: MediaClip[];
      offset: number;
    }) => {
      const clip = audioClips.find((row) => row.media_id === clipId);
      if (!clip) {
        return;
      }

      const clip_uuid = uuid.v4();
      const newClip = {
        ...clip,
        type: ClipType.AUDIO,
        group: ClipGroup.CHARACTER,
        offset,
        clip_uuid,
        object_uuid: characterId,
      } as Clip;

      setCharacters((oldCharacters) => {
        return oldCharacters.map((character) => {
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
      });

      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.ADD_CLIP,
        data: newClip,
      });
    },
    [],
  );

  const addCharacterKeyframe = useCallback(
    (keyframe: QueueKeyframe, offset: number) => {
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

      setCharacters((oldCharacters) => {
        return oldCharacters.map((character) => {
          if (character.id !== keyframe.object_uuid) {
            return { ...character };
          }
          return {
            ...character,
            positionKeyframes: [
              ...character.positionKeyframes,
              newKeyframe,
            ].sort(
              (keyFrameA, keyframeB) => keyFrameA.offset - keyframeB.offset,
            ),
          };
        });
      });

      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.ADD_KEYFRAME,
        data: newKeyframe,
      });
    },
    [],
  );

  const toggleLipSyncMute = useCallback((characterId: string) => {
    setCharacters((oldCharacters) => {
      return oldCharacters.map((character) => {
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
          muted:
            character.id === characterId ? !character.muted : character.muted,
        };
      });
    });
  }, []);

  const selectCharacterClip = useCallback((clipId: string) => {
    setCharacters((oldCharacters) => {
      return [
        ...oldCharacters.map((character) => ({
          ...character,
          animationClips: character.animationClips.map((clip) => ({
            ...clip,
            selected:
              clip.clip_uuid === clipId ? !clip.selected : clip.selected,
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
            selected:
              clip.clip_uuid === clipId ? !clip.selected : clip.selected,
          })),
        })),
      ];
    });
  }, []);

  const deleteCharacterClip = useCallback((clipId: string) => {
    setCharacters((oldCharacters) => {
      return [
        ...oldCharacters.map((character) => ({
          ...character,
          animationClips: character.animationClips.filter((clip) => {
            if (clip.clip_uuid === clipId) {
              Queue.publish({
                queueName: QueueNames.TO_ENGINE,
                action: toEngineActions.DELETE_CLIP,
                data: clip!,
              });
              return false;
            }
            return true;
          }),
          lipSyncClips: character.lipSyncClips.filter((clip) => {
            if (clip.clip_uuid === clipId) {
              Queue.publish({
                queueName: QueueNames.TO_ENGINE,
                action: toEngineActions.DELETE_CLIP,
                data: clip!,
              });
              return false;
            }
            return true;
          }),
        })),
      ];
    });
  }, []);

  const deleteCharacterKeyframe = useCallback((keyframe: Keyframe) => {
    setCharacters((oldCharacters) => {
      return [
        ...oldCharacters.map((character) => ({
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
        })),
      ];
    });
  }, []);

  return {
    characters,
    updateCharacters,
    toggleLipSyncMute,
    addCharacterAnimation,
    addCharacterAudio,
    selectCharacterClip,
    deleteCharacterClip,
    addCharacterKeyframe,
    deleteCharacterKeyframe,
  };
}
