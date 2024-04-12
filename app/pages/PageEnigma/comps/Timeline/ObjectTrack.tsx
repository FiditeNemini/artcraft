import { fullWidth, updateObject } from "~/pages/PageEnigma/store";
import { TrackKeyFrames } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrames";
import { ClipGroup, ObjectTrack } from "~/pages/PageEnigma/models";

interface Props {
  object: ObjectTrack;
}

export const ObjectTrackComponent = ({ object }: Props) => {
  return (
    <div
      className="mr-4 block rounded-r-lg bg-object-groupBg pb-5 pr-4"
      style={{ width: fullWidth.value + 32 }}
    >
      <div key={object.object_uuid} className="pt-4">
        <TrackKeyFrames
          id={object.object_uuid}
          keyframes={object.keyframes}
          title={`${object.name} Position/Rotation`}
          updateKeyframe={updateObject}
          group={ClipGroup.OBJECT}
        />
      </div>
    </div>
  );
};
