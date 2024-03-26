import { TrackClip } from "./TrackClip";
import { useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";

export const Camera = () => {
  const { camera, updateCamera, length, scale } = useContext(TrackContext);
  const fullWidth = length * 60 * 4 * scale;
  const { clips } = camera!;

  return (
    <div
      className="block rounded-lg bg-camera-groupBg pb-5 pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="mb-5 pt-2 text-xs font-medium text-white">Camera</div>
      <div className="flex flex-col gap-2">
        <div className="pl-16">
          <div className="relative mt-4 block h-9 w-full rounded-lg bg-camera-unselected">
            {clips.map((clip, index) => (
              <TrackClip
                key={clip.id}
                min={
                  index > 0
                    ? clips[index - 1].offset + clips[index - 1].length
                    : 0
                }
                max={index < clips.length - 1 ? clips[index + 1].offset : 1000}
                style="camera"
                updateClip={updateCamera}
                clip={clip}
              />
            ))}
            <div className="absolute ps-2 pt-1 text-xs font-medium text-white">
              Camera Position/Rotation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
