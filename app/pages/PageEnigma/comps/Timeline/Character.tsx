import { useCallback, useContext, useMemo } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { Track } from "~/pages/PageEnigma/comps/Timeline/Track";

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
  const { characters, updateCharacters, length, scale, toggleLipSyncMute } =
    useContext(TrackContext);
  const fullWidth = length * 60 * 4 * scale;
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
      className="block rounded-lg bg-character-groupBg pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="mb-2 text-xs text-white">Character</div>
      <div className="flex flex-col gap-2">
        <Track
          clips={animationClips}
          title="Animation"
          updateClip={updateClipAnimations}
          style="character"
          type="animations"
        />
        <Track
          clips={positionClips}
          title="Character Position/Rotation"
          updateClip={updateClipPosition}
          style="character"
          type="positions"
        />
        <Track
          clips={lipSyncClips}
          title="Lipsync Audio Track"
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
