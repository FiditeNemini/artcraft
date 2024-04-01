import { useCallback, useMemo } from "react";
import { TrackClips } from "~/pages/PageEnigma/comps/Timeline/TrackClips";
import {
  characterGroups,
  fullWidth,
  toggleLipSyncMute,
  updateCharacters,
} from "~/pages/PageEnigma/store";
import { TrackKeyFrames } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrames";

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
  function updateClipPosition(options: { id: string; offset: number }) {
    updateCharacters({ ...options, length: 0, type: "positions" });
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
  const character = characterGroups.value.find((row) => (row.id = characterId));

  const { updateClipLipSync, updateClipPosition, updateClipAnimations } =
    useMemo(() => buildUpdaters(updateCharacters), []);

  const toggleCharacterLipSyncMute = useCallback(() => {
    toggleLipSyncMute(character?.id ?? "");
  }, [character?.id]);

  if (!character) {
    return false;
  }
  const { animationClips, positionKeyframes, lipSyncClips } = character;

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
        <TrackKeyFrames
          id={character.id}
          keyframes={positionKeyframes}
          title="Character Position/Rotation"
          updateKeyframe={updateClipPosition}
          style="character"
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
