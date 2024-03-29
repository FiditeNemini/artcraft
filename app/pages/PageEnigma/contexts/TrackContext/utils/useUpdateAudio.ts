import { useCallback, useState } from "react";
import {
  AudioGroup,
  Clip,
  ClipGroup,
  ClipType,
  MediaClip,
} from "~/pages/PageEnigma/models/track";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";
import * as uuid from "uuid";

export default function useUpdateAudio() {
  const [audio, setAudio] = useState<AudioGroup>({
    id: "AU1",
    muted: false,
    clips: [],
  });

  const updateAudio = useCallback(
    ({
      id,
      offset,
      length,
    }: {
      id: string;
      length: number;
      offset: number;
    }) => {
      setAudio((oldAudio) => {
        const newClips = [...oldAudio.clips];
        const clipIndex = newClips.findIndex((row) => row.clip_uuid === id);
        if (clipIndex === -1) {
          return { ...oldAudio };
        }
        const clip = newClips[clipIndex];
        clip.offset = offset;
        clip.length = length;

        Queue.publish({
          queueName: QueueNames.TO_ENGINE,
          action: toEngineActions.UPDATE_CLIP,
          data: clip,
        });

        return {
          ...oldAudio,
          clips: newClips,
        };
      });
    },
    [],
  );

  const addGlobalAudio = useCallback(
    (dragId: string, audioClips: MediaClip[], offset: number) => {
      const clip = audioClips.find((row) => row.media_id === dragId);
      if (!clip) {
        return;
      }

      const clip_uuid = uuid.v4();
      const newClip = {
        ...clip,
        type: ClipType.AUDIO,
        group: ClipGroup.GLOBAL_AUDIO,
        offset,
        clip_uuid,
      } as Clip;

      setAudio((oldAudio) => {
        return {
          ...oldAudio,
          clips: [...oldAudio.clips, newClip],
        };
      });

      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: toEngineActions.ADD_CLIP,
        data: newClip,
      });
    },
    [],
  );

  const toggleAudioMute = useCallback(() => {
    setAudio((oldAudio) => {
      Queue.publish({
        queueName: QueueNames.TO_ENGINE,
        action: oldAudio?.muted ? toEngineActions.UNMUTE : toEngineActions.MUTE,
        data: {
          version: 1,
          type: ClipType.AUDIO,
          group: ClipGroup.GLOBAL_AUDIO,
        },
      });

      return {
        ...oldAudio,
        muted: !oldAudio.muted,
      };
    });
  }, []);

  const selectAudioClip = useCallback((clipId: string) => {
    setAudio((oldAudio) => {
      return {
        ...oldAudio,
        clips: [
          ...oldAudio.clips.map((clip) => {
            return {
              ...clip,
              selected:
                clip.clip_uuid === clipId ? !clip.selected : clip.selected,
            };
          }),
        ],
      };
    });
  }, []);

  const deleteAudioClip = useCallback((clipId: string) => {
    setAudio((oldAudio) => {
      return {
        ...oldAudio,
        clips: [
          ...oldAudio.clips.filter((clip) => {
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
        ],
      };
    });
  }, []);

  return {
    audio,
    updateAudio,
    toggleAudioMute,
    selectAudioClip,
    addGlobalAudio,
    deleteAudioClip,
  };
}
