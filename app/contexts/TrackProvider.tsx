import { TrackContext } from "~/contexts/TrackContext";
import { ReactNode, useCallback, useMemo, useState } from "react";
import { CharacterTrack } from "~/models/track";

interface Props {
  children: ReactNode;
}

export const TrackProvider = ({ children }: Props) => {
  const [characters, setCharacters] = useState<CharacterTrack[]>([
    {
      id: "t1",
      animationClips: [
        {
          id: "1",
          length: 200,
          offset: 0,
          name: "track 1",
          selected: false,
        },
        {
          id: "2",
          length: 180,
          offset: 300,
          name: "track 2",
          selected: false,
        },
      ],
      positionClips: [],
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
    },
    [],
  );

  const selectClip = useCallback(
    ({
      type,
      id,
    }: {
      type: "animations" | "positions" | "lipSync";
      id: string;
    }) => {
      if (type === "animations") {
        setCharacters((oldCharacters) => {
          return oldCharacters.map((character) => {
            const newAnimationClips = character.animationClips.map((clip) => ({
              ...clip,
              selected: false,
            }));
            const newPositionClips = character.positionClips.map((clip) => ({
              ...clip,
              selected: false,
            }));
            const newLipSyncClips = character.lipSyncClips.map((clip) => ({
              ...clip,
              selected: false,
            }));
            const clipIndex = newAnimationClips.findIndex(
              (row) => row.id === id,
            );
            if (clipIndex === -1) {
              return {
                ...character,
                animationClips: newAnimationClips,
                positionClips: newPositionClips,
                lipSyncClips: newLipSyncClips,
              };
            }
            const clip = newAnimationClips[clipIndex];
            clip.selected = true;
            return {
              ...character,
              animationClips: newAnimationClips,
              positionClips: newPositionClips,
              lipSyncClips: newLipSyncClips,
            };
          });
        });
        return;
      }
    },
    [],
  );

  console.log(characters);

  const values = useMemo(() => {
    return {
      characters,
      updateCharacters,
      selectClip,
    };
  }, [characters, updateCharacters]);
  return (
    <TrackContext.Provider value={values}>{children}</TrackContext.Provider>
  );
};
