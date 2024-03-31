import { useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { fullWidth } from "~/pages/PageEnigma/store";
import { TrackKeyFrames } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrames";

export const Objects = () => {
  const { objects, updateObject } = useContext(TrackContext);

  return (
    <div
      className="block rounded-lg bg-objects-groupBg pb-5 pl-2 pr-4"
      style={{ width: fullWidth.value + 90 }}
    >
      <div className="prevent-select mb-5 pt-2 text-xs font-medium text-white">
        Objects
      </div>
      {objects.objects.map((object) => (
        <div key={object.object_uuid} className="flex flex-col gap-4">
          <TrackKeyFrames
            id={object.object_uuid}
            keyframes={object.keyframes}
            title="Mask Position/Rotation"
            updateKeyframe={updateObject}
            style="objects"
          />
        </div>
      ))}
    </div>
  );
};
