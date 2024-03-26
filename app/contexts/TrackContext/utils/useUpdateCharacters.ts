import { useCallback, useRef, useState } from "react";
import { CharacterGroup } from "~/models/track";

export default function useUpdateCharacters() {
  const [characters, setCharacters] = useState<CharacterGroup[]>([
    {
      id: "CH1",
      muted: false,
      animationClips: [
        {
          id: "CH1-A1",
          length: 200,
          offset: 0,
          name: "ani 1",
        },
        {
          id: "CH1-A2",
          length: 180,
          offset: 300,
          name: "ani 2",
        },
      ],
      positionClips: [
        {
          id: "CH1-P1",
          length: 200,
          offset: 100,
          name: "pos 1",
        },
        {
          id: "CH1-P2",
          length: 180,
          offset: 500,
          name: "pos 2",
        },
      ],
      lipSyncClips: [
        {
          id: "CH1-L1",
          length: 400,
          offset: 150,
          name: "sync 1",
        },
      ],
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
              (row) => row.id === id,
            );
            if (clipIndex === -1) {
              return { ...character };
            }
            const clip = newAnimationClips[clipIndex];
            clip.offset = offset;
            clip.length = length;
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
            const newPositionClips = [...character.positionClips];
            const clipIndex = newPositionClips.findIndex(
              (row) => row.id === id,
            );
            if (clipIndex === -1) {
              return { ...character };
            }
            const clip = newPositionClips[clipIndex];
            clip.offset = offset;
            clip.length = length;
            return {
              ...character,
              positionClips: newPositionClips,
            };
          });
        });
        return;
      }
      if (type === "lipSync") {
        setCharacters((oldCharacters) => {
          return oldCharacters.map((character) => {
            const newLipSyncClips = [...character.lipSyncClips];
            const clipIndex = newLipSyncClips.findIndex((row) => row.id === id);
            if (clipIndex === -1) {
              return { ...character };
            }
            const clip = newLipSyncClips[clipIndex];
            clip.offset = offset;
            clip.length = length;
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

  const toggleLipSyncMute = useCallback((characterId: string) => {
    setCharacters((oldCharacters) => {
      return oldCharacters.map((character) => ({
        ...character,
        muted:
          character.id === characterId ? !character.muted : character.muted,
      }));
    });
  }, []);

  return {
    characters,
    updateCharacters,
    toggleLipSyncMute,
  };
}
