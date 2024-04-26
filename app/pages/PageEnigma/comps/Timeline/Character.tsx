import { useContext, useMemo } from "react";
import { TrackClips } from "~/pages/PageEnigma/comps/Timeline/TrackClips";
import {
  fullWidth,
  minimizeIconPosition,
  toggleCharacterMinimized,
  updateCharacters,
} from "~/pages/PageEnigma/store";
import { TrackKeyFrames } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrames";
import { CharacterTrack, ClipGroup, ClipType } from "~/pages/PageEnigma/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/pro-solid-svg-icons";
import { AddToast, ToasterContext } from "~/contexts/ToasterContext";

function buildUpdaters(
  updateCharacters: (options: {
    type: ClipType;
    id: string;
    length: number;
    offset: number;
    addToast: AddToast;
  }) => void,
  addToast: AddToast,
) {
  function updateClipAnimations(options: {
    id: string;
    length: number;
    offset: number;
  }) {
    updateCharacters({ ...options, type: ClipType.ANIMATION, addToast });
  }
  function updateClipPosition(options: { id: string; offset: number }) {
    updateCharacters({
      ...options,
      length: 0,
      type: ClipType.TRANSFORM,
      addToast,
    });
  }
  function updateClipLipSync(options: {
    id: string;
    length: number;
    offset: number;
  }) {
    updateCharacters({ ...options, type: ClipType.AUDIO, addToast });
  }
  return { updateClipLipSync, updateClipPosition, updateClipAnimations };
}

interface Props {
  character: CharacterTrack;
}

export const Character = ({ character }: Props) => {
  const { addToast } = useContext(ToasterContext);
  const { updateClipLipSync, updateClipPosition, updateClipAnimations } =
    useMemo(() => buildUpdaters(updateCharacters, addToast), [addToast]);

  const { animationClips, positionKeyframes, lipSyncClips, minimized } =
    character;

  if (minimized) {
    return (
      <div
        className="relative flex h-[35px] items-center justify-end rounded-r-lg bg-character-groupBg pr-4"
        style={{ width: fullWidth.value + 16 }}>
        <button
          className="absolute"
          style={{
            left: minimizeIconPosition.value,
          }}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            toggleCharacterMinimized(character.object_uuid);
          }}>
          <FontAwesomeIcon icon={faAngleDown} />
        </button>
      </div>
    );
  }

  return (
    <div
      className="relative block rounded-r-lg bg-character-groupBg pb-5 pr-4"
      style={{ width: fullWidth.value + 16 }}>
      <div className="flex h-[35px] items-center justify-end">
        <button
          className="absolute"
          style={{
            left: minimizeIconPosition.value,
          }}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            toggleCharacterMinimized(character.object_uuid);
          }}>
          <FontAwesomeIcon icon={faAngleUp} />
        </button>
      </div>
      <div className="flex flex-col gap-3 pt-[12px]">
        <TrackClips
          id={character.object_uuid}
          clips={animationClips}
          updateClip={updateClipAnimations}
          group={ClipGroup.CHARACTER}
          type={ClipType.ANIMATION}
        />
        <TrackKeyFrames
          id={character.object_uuid}
          keyframes={positionKeyframes}
          updateKeyframe={updateClipPosition}
          group={ClipGroup.CHARACTER}
        />
        <TrackClips
          id={character.object_uuid}
          clips={lipSyncClips}
          updateClip={updateClipLipSync}
          group={ClipGroup.CHARACTER}
          type={ClipType.AUDIO}
        />
      </div>
    </div>
  );
};
