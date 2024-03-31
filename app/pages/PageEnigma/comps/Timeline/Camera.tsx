import { useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { fullWidth } from "~/pages/PageEnigma/store";
import { TrackKeyFrames } from "~/pages/PageEnigma/comps/Timeline/TrackKeyFrames";

export const Camera = () => {
  const { camera, updateCamera } = useContext(TrackContext);
  const { keyframes } = camera!;

  return (
    <div
      className="block rounded-lg bg-camera-groupBg pb-5 pl-2 pr-4"
      style={{ width: fullWidth.value + 90 }}
    >
      <div className="mb-5 pt-2 text-xs font-medium text-white">Camera</div>
      <div className="flex flex-col gap-4">
        <TrackKeyFrames
          id={camera!.id}
          keyframes={keyframes}
          title="Camera Position/Rotation"
          style="camera"
          updateKeyframe={updateCamera}
        />
      </div>
    </div>
  );
};
