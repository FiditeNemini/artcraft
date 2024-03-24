import { TrackClip } from "./TrackClip";
import { CharacterTrack } from "~/models/track";

interface Props {
  scale: number;
  time: number;
  character: CharacterTrack;
  updateClip: (id: string, offset: number, length: number) => void;
}

export const Character = ({
  character: { animationClips },
  updateClip,
}: Props) => {
  return (
    <div className="bg-charcter-groupBg block h-48 w-full rounded-lg p-2">
      <div className="mb-2 text-sm text-white">Character</div>
      <div className="flex flex-col gap-2">
        <div className="px-4">
          <div className="bg-character-clip relative mt-4 block h-8 w-full rounded">
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
                    : 1000
                }
                updateClip={updateClip}
                clip={clip}
              />
            ))}
          </div>
        </div>
        <div className="px-4">
          <div className="relative mt-4 block h-8 w-full rounded bg-brand-secondary-800"></div>
        </div>
        <div className="px-4">
          <div className="relative mt-4 block h-8 w-full rounded bg-brand-secondary-800"></div>
        </div>
      </div>
    </div>
  );
};
