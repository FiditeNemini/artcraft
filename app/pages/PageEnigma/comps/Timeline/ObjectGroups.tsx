import { objectGroup } from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";
import { ObjectTrackComponent } from "~/pages/PageEnigma/comps/Timeline/ObjectTrack";

export const ObjectGroups = () => {
  useSignals();

  return (
    <>
      {objectGroup.value.objects.map((object) => (
        <div key={object.object_uuid} className="pb-4 pr-4">
          <ObjectTrackComponent object={object} />
        </div>
      ))}
    </>
  );
};
