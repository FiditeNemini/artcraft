import { useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { Track } from "~/pages/PageEnigma/comps/Timeline/Track";
import { ClipContext } from "~/contexts/ClipContext/ClipContext";

export const Objects = () => {
  const { objects, updateObject } = useContext(TrackContext);
  const { length, scale } = useContext(ClipContext);
  const fullWidth = length * 60 * 4 * scale;

  return (
    <div
      className="bg-objects-groupBg block rounded-lg pb-5 pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="prevent-select mb-5 pt-2 text-xs font-medium text-white">
        Objects
      </div>
      {objects.objects.map((object) => (
        <div key={object.id} className="flex flex-col gap-2">
          <Track
            clips={object.clips}
            title="Mask Position/Rotation"
            updateClip={updateObject}
            style="objects"
          />
        </div>
      ))}
    </div>
  );
};
