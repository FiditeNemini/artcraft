import { useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { Track } from "~/pages/PageEnigma/comps/Timeline/Track";

export const Objects = () => {
  const { objects, updateObject, fullWidth } = useContext(TrackContext);

  return (
    <div
      className="block rounded-lg bg-objects-groupBg pb-5 pl-2 pr-4"
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
