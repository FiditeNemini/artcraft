import { ShapeElement } from "~/pages/PageEnigma/comps/SidePanelTabs/shapes/ShapeElement";
import { shapeItems } from "~/pages/PageEnigma/store";

export const ShapeElements = () => {
  return (
    <div className="flex flex-wrap gap-3">
      {shapeItems.value.map((item) => {
        return <ShapeElement key={item.media_id} item={item} />;
      })}
    </div>
  );
};
