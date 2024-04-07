import { CameraElement } from "~/pages/PageEnigma/comps/SidePanelTabs/camera/CameraElement";
import { cameraItems } from "~/pages/PageEnigma/store";

export const CameraElements = () => {
  return (
    <div className="flex flex-wrap gap-3">
      {cameraItems.value.map((item) => {
        return <CameraElement key={item.media_id} item={item} />;
      })}
    </div>
  );
};
