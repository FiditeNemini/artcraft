import { TrackClip } from "./TrackClip";
import { useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";

export const Objects = () => {
  const { objects, updateObject, length, scale } = useContext(TrackContext);
  const fullWidth = length * 60 * 4 * scale;

  return (
    <div
      className="block rounded-lg bg-character-groupBg pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="mb-2 text-sm text-white">Objects</div>
      {objects.objects.map((object) => (
        <div key={object.id} className="flex flex-col gap-2">
          <div className="pl-16">
            <div className="bg-objects-unselected relative mt-4 block h-8 w-full rounded">
              {object.clips.map((clip, index) => (
                <TrackClip
                  key={clip.id}
                  min={
                    index > 0
                      ? object.clips[index - 1].offset +
                        object.clips[index - 1].length
                      : 0
                  }
                  max={
                    index < object.clips.length - 1
                      ? object.clips[index + 1].offset
                      : 0
                  }
                  style="objects"
                  updateClip={updateObject}
                  clip={clip}
                />
              ))}
              <div
                className="absolute text-xs text-white"
                style={{ top: 6, left: 4 }}
              >
                Mask Position/Rotation
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
