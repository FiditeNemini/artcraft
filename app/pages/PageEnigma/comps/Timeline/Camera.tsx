import { useContext } from "react";
import { TrackContext } from "~/contexts/TrackContext/TrackContext";
import { Track } from "~/pages/PageEnigma/comps/Timeline/Track";

export const Camera = () => {
  const { camera, updateCamera, length, scale } = useContext(TrackContext);
  const fullWidth = length * 60 * 4 * scale;
  const { clips } = camera!;

  return (
    <div
      className="bg-camera-groupBg block rounded-lg pl-2 pr-4"
      style={{ width: fullWidth + 90 }}
    >
      <div className="mb-2 text-sm text-white">Camera</div>
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
