import { objectGroup } from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";
import { ObjectTrack } from "~/pages/PageEnigma/comps/Timeline/ObjectTrack";

export const ObjectGroups = () => {
  useSignals();
  return (
    <>
      {objectGroup.value.objects.length > 0 && (
        <div className="p-4">
          <ObjectTrack />
        </div>
      )}
    </>
  );
};
