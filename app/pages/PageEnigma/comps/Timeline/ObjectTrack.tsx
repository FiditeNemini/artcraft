import { fullWidth, updateObject } from "~/pages/PageEnigma/store";
import { TrackKeyFrames } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrames";
import { ClipGroup, ObjectTrack } from "~/pages/PageEnigma/models";

interface Props {
  object: ObjectTrack;
}

export const ObjectTrackComponent = ({ object }: Props) => {
  return (
    <TrackKeyFrames
      id={object.object_uuid}
      keyframes={object.keyframes}
      updateKeyframe={updateObject}
      group={ClipGroup.OBJECT}
    />
  );
};
