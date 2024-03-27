import { useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { Track } from "~/pages/PageEnigma/comps/Timeline/Track";

export const Camera = () => {
  const { camera, fullWidth, updateCamera } = useContext(TrackContext);
  const { clips } = camera!;

  return (
    <div
      className="block rounded-lg bg-camera-groupBg pb-5 pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="mb-5 pt-2 text-xs font-medium text-white">Camera</div>
      <div className="flex flex-col gap-2">
        <Track
          clips={clips}
          title="Camera Position/Rotation"
          style="camera"
          updateClip={updateCamera}
        />
      </div>
    </div>
  );
};
