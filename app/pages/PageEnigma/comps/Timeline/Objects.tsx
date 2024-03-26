import { useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { Track } from "~/pages/PageEnigma/comps/Timeline/Track";

export const Objects = () => {
  const { objects, updateObject, length, scale } = useContext(TrackContext);
  const fullWidth = length * 60 * 4 * scale;

  return (
    <div
      className="bg-objects-groupBg block rounded-lg pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="mb-2 text-sm text-white">Objects</div>
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
