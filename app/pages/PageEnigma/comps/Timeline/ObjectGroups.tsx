import {
  fullWidth,
  minimizeIconPosition,
  objectGroup,
  objectsMinimized,
  selectedObject,
} from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";
import { ObjectTrackComponent } from "~/pages/PageEnigma/comps/Timeline/ObjectTrack";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/pro-solid-svg-icons";

export const ObjectGroups = () => {
  useSignals();

  if (!objectGroup.value.objects.length) {
    return null;
  }

  if (objectsMinimized.value) {
    return (
      <div
        id="track-objects"
        className="relative mb-4 flex h-[35px] items-center justify-end rounded-r-lg bg-object-groupBg pr-4"
        style={{ width: fullWidth.value + 16 }}>
        <button
          className="absolute"
          style={{
            left: minimizeIconPosition.value,
          }}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            objectsMinimized.value = !objectsMinimized.value;
          }}>
          <FontAwesomeIcon icon={faAngleDown} />
        </button>
      </div>
    );
  }

  return (
    <div
      id="track-objects"
      className="relative mb-5 block rounded-r-lg  bg-object-groupBg pr-4"
      style={{ width: fullWidth.value + 16 }}>
      <button
        className="absolute"
        style={{
          left: minimizeIconPosition.value,
        }}
        onClick={(event) => {
          event.stopPropagation();
          event.preventDefault();
          objectsMinimized.value = !objectsMinimized.value;
        }}>
        <FontAwesomeIcon icon={faAngleUp} />
      </button>
      <div className="pt-[47px]">
        {objectGroup.value.objects.map((object) => (
          <div
            key={object.object_uuid}
            className="pb-4 pr-4"
            id={`track-object-${selectedObject.value?.id}`}>
            <ObjectTrackComponent object={object} />
          </div>
        ))}
      </div>
    </div>
  );
};
