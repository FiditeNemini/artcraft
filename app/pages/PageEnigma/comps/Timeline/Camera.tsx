import { cameraGroup, fullWidth, updateCamera } from "~/pages/PageEnigma/store";
import { TrackKeyFrames } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrames";
import { useSignals } from "@preact/signals-react/runtime";
import { ClipGroup } from "~/pages/PageEnigma/models/track";

export const Camera = () => {
  useSignals();
  const { keyframes } = cameraGroup.value!;

  return (
    <div
      className="block rounded-lg bg-camera-groupBg pb-5 pl-2 pr-4"
      style={{ width: fullWidth.value + 90 }}
    >
      <div className="mb-5 pt-2 text-xs font-medium text-white">Camera</div>
      <div className="flex flex-col gap-4">
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
