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
import { EngineContext } from "~/contexts/EngineContext";
import { environmentVariables } from "~/store";

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

  function updateClipEmotions(options: {
    id: string;
    length: number;
    offset: number;
  }) {
    updateCharacters({ ...options, type: ClipType.EXPRESSION, addToast });
  }

  function updateClipLipSync(options: {
    id: string;
    length: number;
    offset: number;
  }) {
    updateCharacters({ ...options, type: ClipType.AUDIO, addToast });
  }
  return {
    updateClipLipSync,
    updateClipPosition,
    updateClipAnimations,
    updateClipEmotions,
  };
}

interface Props {
  character: CharacterTrack;
}

export const Character = ({ character }: Props) => {
  const { addToast } = useContext(ToasterContext);
  const editorEngine = useContext(EngineContext);

  const {
    updateClipLipSync,
    updateClipPosition,
    updateClipAnimations,
    updateClipEmotions,
  } = useMemo(() => buildUpdaters(updateCharacters, addToast), [addToast]);

  const {
    animationClips,
    positionKeyframes,
    lipSyncClips,
    expressionClips,
    minimized,
  } = character;

  if (minimized) {
    return (
      <div
        id={`track-character-${character.object_uuid}`}
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
      id={`track-character-${character.object_uuid}`}
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
        {environmentVariables.value.EXPRESSIONS && (
          <TrackClips
            id={character.object_uuid}
            clips={expressionClips}
            updateClip={updateClipEmotions}
            group={ClipGroup.CHARACTER}
            type={ClipType.EXPRESSION}
          />
        )}
        {editorEngine && editorEngine.isObjectLipsync(character.object_uuid) && 
          <TrackClips
            id={character.object_uuid}
            clips={lipSyncClips}
            updateClip={updateClipLipSync}
            group={ClipGroup.CHARACTER}
            type={ClipType.AUDIO}
          />
        }
      </div>
    </div>
  );
};
