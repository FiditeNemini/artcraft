import { TrackClip } from "./TrackClip";
import { useContext, useMemo, useRef } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";

function buildUpdaters(updateCharacters: any) {
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
  const { characters, updateCharacters, length, scale } =
    useContext(TrackContext);
  const fullWidth = length * 60 * 4 * scale;
  const character = characters.find((row) => (row.id = characterId));

  const { updateClipLipSync, updateClipPosition, updateClipAnimations } =
    useMemo(() => buildUpdaters(updateCharacters), [updateCharacters]);

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
        <div className="pl-16">
          <div className="relative mt-4 block h-8 rounded bg-character-unselected">
            {animationClips.map((clip, index) => (
              <TrackClip
                key={clip.id}
                min={
                  index > 0
                    ? animationClips[index - 1].offset +
                      animationClips[index - 1].length
                    : 0
                }
                max={
                  index < animationClips.length - 1
                    ? animationClips[index + 1].offset
                    : length * 60
                }
                style="character"
                updateClip={updateClipAnimations}
                clip={clip}
              />
            ))}
            <div
              className="absolute text-xs text-white"
              style={{ top: 6, left: 4 }}
            >
              Animation
            </div>
          </div>
        </div>
        <div className="pl-16">
          <div className="relative mt-4 block h-8 w-full rounded bg-character-unselected">
            {positionClips.map((clip, index) => (
              <TrackClip
                key={clip.id}
                min={
                  index > 0
                    ? positionClips[index - 1].offset +
                      positionClips[index - 1].length
                    : 0
                }
                max={
                  index < positionClips.length - 1
                    ? positionClips[index + 1].offset
                    : length * 60
                }
                style="character"
                updateClip={updateClipPosition}
                clip={clip}
              />
            ))}
            <div
              className="absolute text-xs text-white"
              style={{ top: 6, left: 4 }}
            >
              Character Position/Rotation
            </div>
          </div>
        </div>
        <div className="pl-16">
          <div className="relative mt-4 block h-8 w-full rounded bg-character-unselected">
            {lipSyncClips.map((clip, index) => (
              <TrackClip
                key={clip.id}
                min={
                  index > 0
                    ? lipSyncClips[index - 1].offset +
                      lipSyncClips[index - 1].length
                    : 0
                }
                max={
                  index < lipSyncClips.length - 1
                    ? lipSyncClips[index + 1].offset
                    : length * 60
                }
                style="character"
                updateClip={updateClipLipSync}
                clip={clip}
              />
            ))}
            <div
              className="absolute text-xs text-white"
              style={{ top: 6, left: 4 }}
            >
              Lipsync Audio Track
            </div>
            <button
              className="absolute text-xs text-white"
              style={{ top: 6, left: -20 }}
            >
              <i className="fas fa-volume-mute"></i>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
