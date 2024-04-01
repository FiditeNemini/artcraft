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
import { signal } from "@preact/signals-core";

export const audioGroup = signal<AudioGroup>({
  id: "AG-1",
  clips: [],
  muted: false,
});

export function updateAudio({
  id,
  offset,
  length,
}: {
  id: string;
  length: number;
  offset: number;
}) {
  const oldAudioGroup = audioGroup.value;
  const newClips = [...oldAudioGroup.clips];
  const clipIndex = newClips.findIndex((row) => row.clip_uuid === id);
  if (clipIndex === -1) {
    return { ...oldAudioGroup };
  }
  const clip = newClips[clipIndex];
  clip.offset = offset;
  clip.length = length;

  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: toEngineActions.UPDATE_CLIP,
    data: clip,
  });

  audioGroup.value = {
    ...oldAudioGroup,
    clips: newClips,
  };
}

export function addGlobalAudio(
  dragId: string,
  audioClips: MediaClip[],
  offset: number,
) {
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

  const oldAudioGroup = audioGroup.value;
  audioGroup.value = {
    ...oldAudioGroup,
    clips: [...oldAudioGroup.clips, newClip],
  };

  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: toEngineActions.ADD_CLIP,
    data: newClip,
  });
}

export function toggleAudioMute() {
  const oldAudioGroup = audioGroup.value;
  Queue.publish({
    queueName: QueueNames.TO_ENGINE,
    action: oldAudioGroup?.muted
      ? toEngineActions.UNMUTE
      : toEngineActions.MUTE,
    data: {
      version: 1,
      type: ClipType.AUDIO,
      group: ClipGroup.GLOBAL_AUDIO,
    },
  });

  audioGroup.value = {
    ...oldAudioGroup,
    muted: !oldAudioGroup.muted,
  };
}

export function selectAudioClip(clipId: string) {
  const oldAudioGroup = audioGroup.value;
  audioGroup.value = {
    ...oldAudioGroup,
    clips: [
      ...oldAudioGroup.clips.map((clip) => {
        return {
          ...clip,
          selected: clip.clip_uuid === clipId ? !clip.selected : clip.selected,
        };
      }),
    ],
  };
}

export function deleteAudioClip(clip: Clip) {
  const oldAudioGroup = audioGroup.value;
  audioGroup.value = {
    ...oldAudioGroup,
    clips: [
      ...oldAudioGroup.clips.filter((row) => {
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
    ],
  };
}
