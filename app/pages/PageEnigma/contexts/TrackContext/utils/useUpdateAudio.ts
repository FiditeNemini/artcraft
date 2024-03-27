import { useCallback, useState } from "react";
import { AudioGroup, BaseClip } from "~/pages/PageEnigma/models/track";

export default function useUpdateAudio() {
  const [audio, setAudio] = useState<AudioGroup>({
    id: "AU1",
    muted: false,
    clips: [
      {
        id: "AU1-1",
        length: 200,
        offset: 0,
        name: "audio 1",
      },
      {
        id: "AU1-2",
        length: 180,
        offset: 300,
        name: "audio 2",
      },
    ],
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
        const clipIndex = newClips.findIndex((row) => row.id === id);
        if (clipIndex === -1) {
          return { ...oldAudio };
        }
        const clip = newClips[clipIndex];
        clip.offset = offset;
        clip.length = length;
        return {
          ...oldAudio,
          clips: newClips,
        };
      });
    },
    [],
  );

  const addGlobalAudio = useCallback(
    (dragId: string, audioClips: BaseClip[]) => {
      const clip = audioClips.find((row) => row.id === dragId);
      if (!clip) {
        return;
      }

      setAudio((oldAudio) => {
        return {
          ...oldAudio,
          clips: [...oldAudio.clips, clip],
        };
      });
    },
    [],
  );

  const toggleAudioMute = useCallback(() => {
    setAudio((oldAudio) => {
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
              selected: clip.id === clipId ? !clip.selected : clip.selected,
            };
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
  };
}
