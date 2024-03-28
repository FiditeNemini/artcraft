import { useCallback, useContext, useMemo } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { TrackClips } from "~/pages/PageEnigma/comps/Timeline/TrackClips";
import { fullWidth } from "~/pages/PageEnigma/store";

function buildUpdaters(
  updateCharacters: (options: {
    type: "animations" | "positions" | "lipSync";
    id: string;
    length: number;
    offset: number;
  }) => void,
) {
  function updateClipAnimations(options: {
    id: string;
    length: number;
    offset: number;
  }) {
    updateCharacters({ ...options, type: "animations" });
  }
  function updateClipPosition(options: {
    id: string;
    length: number;
    offset: number;
  }) {
    updateCharacters({ ...options, type: "positions" });
  }
  function updateClipLipSync(options: {
    id: string;
    length: number;
    offset: number;
  }) {
    updateCharacters({ ...options, type: "lipSync" });
  }
  return { updateClipLipSync, updateClipPosition, updateClipAnimations };
}
interface Props {
  characterId: string;
}

export const Character = ({ characterId }: Props) => {
  const { characters, updateCharacters, toggleLipSyncMute } =
    useContext(TrackContext);
  const character = characters.find((row) => (row.id = characterId));

  const { updateClipLipSync, updateClipPosition, updateClipAnimations } =
    useMemo(() => buildUpdaters(updateCharacters), [updateCharacters]);
  const toggleCharacterLipSyncMute = useCallback(() => {
    toggleLipSyncMute(character?.id ?? "");
  }, []);

  if (!character) {
    return false;
  }
  const { animationClips, positionClips, lipSyncClips } = character;

  return (
    <div
      className="block rounded-lg bg-character-groupBg pb-5 pl-2 pr-4"
      style={{ width: fullWidth.value + 90 }}
    >
      <div className="prevent-select mb-5 pt-2 text-xs font-medium text-white">
        Character
      </div>
      <div className="flex flex-col gap-4">
        <TrackClips
          id={character.id}
          clips={animationClips}
          title="Animation"
          updateClip={updateClipAnimations}
          style="character"
          type="animations"
        />
        <TrackClips
          id={character.id}
          clips={positionClips}
          title="Character Position/Rotation"
          updateClip={updateClipPosition}
          style="character"
          type="positions"
        />
        <TrackClips
          id={character.id}
          clips={lipSyncClips}
          title="Lipsync Audio TrackClips"
          updateClip={updateClipLipSync}
          muted={character.muted}
          toggleMute={toggleCharacterLipSyncMute}
          style="character"
          type="lipSync"
        />
      </div>
    </div>
  );
};
