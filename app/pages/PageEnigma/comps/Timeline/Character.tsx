import { useCallback, useMemo } from "react";
import { TrackClips } from "~/pages/PageEnigma/comps/Timeline/TrackClips";
import {
  fullWidth,
  toggleLipSyncMute,
  updateCharacters,
} from "~/pages/PageEnigma/store";
import { TrackKeyFrames } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrames";
import { CharacterTrack, ClipGroup, ClipType } from "~/pages/PageEnigma/models";

function buildUpdaters(
  updateCharacters: (options: {
    type: ClipType;
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
    updateCharacters({ ...options, type: ClipType.ANIMATION });
  }
  function updateClipPosition(options: { id: string; offset: number }) {
    updateCharacters({ ...options, length: 0, type: ClipType.TRANSFORM });
  }
  function updateClipLipSync(options: {
    id: string;
    length: number;
    offset: number;
  }) {
    updateCharacters({ ...options, type: ClipType.AUDIO });
  }
  return { updateClipLipSync, updateClipPosition, updateClipAnimations };
}
interface Props {
  character: CharacterTrack;
}

export const Character = ({ character }: Props) => {
  const { updateClipLipSync, updateClipPosition, updateClipAnimations } =
    useMemo(() => buildUpdaters(updateCharacters), []);

  const { animationClips, positionKeyframes, lipSyncClips } = character;

  return (
    <div
      className="block rounded-r-lg bg-character-groupBg pb-5 pr-4"
      style={{ width: fullWidth.value + 16 }}
    >
      <div className="flex flex-col gap-4 pt-4">
        <TrackClips
          id={character.object_uuid}
          clips={animationClips}
          title="Animation"
          updateClip={updateClipAnimations}
          group={ClipGroup.CHARACTER}
          type={ClipType.ANIMATION}
        />
        <TrackKeyFrames
          id={character.object_uuid}
          keyframes={positionKeyframes}
          title="Character Position/Rotation"
          updateKeyframe={updateClipPosition}
          group={ClipGroup.CHARACTER}
        />
        <TrackClips
          id={character.object_uuid}
          clips={lipSyncClips}
          title="Lipsync Audio TrackClips"
          updateClip={updateClipLipSync}
          group={ClipGroup.CHARACTER}
          type={ClipType.AUDIO}
        />
      </div>
    </div>
  );
};
