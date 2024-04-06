import { useContext } from "react";
import { TrackContext } from "~/pages/PageEnigma/contexts/TrackContext/TrackContext";
import { ShapeElement } from "~/pages/PageEnigma/comps/SidePanelTabs/shapes/ShapeElement";

export const ShapeElements = () => {
  const { shapeItems } = useContext(TrackContext);

  return (
    <div className="flex flex-wrap gap-3">
      {shapeItems.map((item) => {
        return <ShapeElement key={item.media_id} item={item} />;
      })}
    </div>
  );
};
