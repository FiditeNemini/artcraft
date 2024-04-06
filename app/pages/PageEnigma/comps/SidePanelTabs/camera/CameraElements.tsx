import { useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { CameraElement } from "~/pages/PageEnigma/comps/SidePanelTabs/camera/CameraElement";

export const CameraElements = () => {
  const { cameraItems } = useContext(TrackContext);

  return (
    <div className="flex flex-wrap gap-3">
      {cameraItems.map((item) => {
        return <CameraElement key={item.media_id} item={item} />;
      })}
    </div>
  );
};
