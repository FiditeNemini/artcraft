import { fullWidth, objectGroup, updateObject } from "~/pages/PageEnigma/store";
import { TrackKeyFrames } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrames";

export const ObjectTrack = () => {
  return (
    <div
      className="block rounded-lg bg-objects-groupBg pb-5 pl-2 pr-4"
      style={{ width: fullWidth.value + 90 }}
    >
      <div className="prevent-select mb-5 pt-2 text-xs font-medium text-white">
        Objects
      </div>
      {objectGroup.value.objects.map((object) => (
        <div key={object.object_uuid} className="flex flex-col gap-4">
          <TrackKeyFrames
            id={object.object_uuid}
            keyframes={object.keyframes}
            title={`${object.name} Position/Rotation`}
            updateKeyframe={updateObject}
            style="objects"
          />
        </div>
      ))}
    </div>
  );
};
