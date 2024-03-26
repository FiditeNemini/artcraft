import { TrackClip } from "./TrackClip";
import { useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";

export const Objects = () => {
  const { objects, updateObject, length, scale } = useContext(TrackContext);
  const fullWidth = length * 60 * 4 * scale;

  return (
    <div
      className="block rounded-lg bg-objects-groupBg pb-5 pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="mb-5 pt-2 text-xs font-medium text-white">Objects</div>
      {objects.objects.map((object) => (
        <div key={object.id} className="flex flex-col gap-2">
          <div className="pl-16">
            <div className="relative mt-4 block h-9 w-full rounded-lg bg-objects-unselected">
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
              <div className="absolute ps-2 pt-1 text-xs font-medium text-white">
                Mask Position/Rotation
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
