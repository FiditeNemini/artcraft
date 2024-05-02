import {
  cameraGroup,
  cameraMinimized,
  fullWidth,
  minimizeIconPosition,
  updateCamera,
} from "~/pages/PageEnigma/store";
import { TrackKeyFrames } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrames";
import { useSignals } from "@preact/signals-react/runtime";
import { ClipGroup } from "~/pages/PageEnigma/models";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleDown, faAngleUp } from "@fortawesome/pro-solid-svg-icons";

export const Camera = () => {
  useSignals();
  const { keyframes } = cameraGroup.value!;

  if (cameraMinimized.value) {
    return (
      <div
        id="track-camera"
        className="relative flex h-[35px] items-center justify-end rounded-r-lg bg-camera-groupBg pr-4"
        style={{ width: fullWidth.value + 16 }}>
        <button
          className="absolute"
          style={{
            left: minimizeIconPosition.value,
          }}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            cameraMinimized.value = !cameraMinimized.value;
          }}>
          <FontAwesomeIcon icon={faAngleDown} />
        </button>
      </div>
    );
  }

  return (
    <div
      id="track-camera"
      className="relative block rounded-r-lg bg-camera-groupBg pb-5 pr-4"
      style={{ width: fullWidth.value + 16 }}>
      <div className="flex justify-end">
        <button
          className="absolute"
          style={{
            left: minimizeIconPosition.value,
          }}
          onClick={(event) => {
            event.stopPropagation();
            event.preventDefault();
            cameraMinimized.value = !cameraMinimized.value;
          }}>
          <FontAwesomeIcon icon={faAngleUp} />
        </button>
      </div>
      <div className="pt-[47px]">
        <TrackKeyFrames
          id={cameraGroup.value.id}
          keyframes={keyframes}
          group={ClipGroup.CAMERA}
          updateKeyframe={updateCamera}
        />
      </div>
    </div>
  );
};
