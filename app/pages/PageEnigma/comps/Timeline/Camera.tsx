import { cameraGroup, fullWidth, updateCamera } from "~/pages/PageEnigma/store";
import { TrackKeyFrames } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrames";
import { useSignals } from "@preact/signals-react/runtime";
import { ClipGroup } from "~/pages/PageEnigma/models";

export const Camera = () => {
  useSignals();
  const { keyframes } = cameraGroup.value!;

  return (
    <div
      className="block rounded-r-lg bg-camera-groupBg pb-5 pr-4"
      style={{ width: fullWidth.value + 16 }}
    >
      <div className="pt-4">
        <TrackKeyFrames
          id={cameraGroup.value.id}
          keyframes={keyframes}
          title="Camera Position/Rotation"
          group={ClipGroup.CAMERA}
          updateKeyframe={updateCamera}
        />
      </div>
    </div>
  );
};
