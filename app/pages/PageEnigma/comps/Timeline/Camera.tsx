import { TrackClip } from "./TrackClip";
import { useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";

export const Camera = () => {
  const { camera, updateCamera, length, scale } = useContext(TrackContext);
  const fullWidth = length * 60 * 4 * scale;
  const { clips } = camera!;

  return (
    <div
      className="bg-camera-groupBg block rounded-lg pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="mb-2 text-sm text-white">Camera</div>
      <div className="flex flex-col gap-2">
        <div className="pl-16">
          <div className="bg-camera-unselected relative mt-4 block h-8 w-full rounded">
            {clips.map((clip, index) => (
              <TrackClip
                key={clip.id}
                min={
                  index > 0
                    ? clips[index - 1].offset + clips[index - 1].length
                    : 0
                }
                max={
                  index < clips.length - 1
                    ? clips[index + 1].offset
                    : length * 60
                }
                style="camera"
                updateClip={updateCamera}
                clip={clip}
              />
            ))}
            <div
              className="absolute text-xs text-white"
              style={{ top: 6, left: 4 }}
            >
              Camera Position/Rotation
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
