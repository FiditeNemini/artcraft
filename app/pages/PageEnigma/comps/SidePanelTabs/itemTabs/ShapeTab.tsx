import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { shapeFilter, shapeItems } from "~/pages/PageEnigma/store";

export const ShapeTab = () => {
  useSignals();

  return (
    <>
      <div className="px-4 pt-4 text-base font-bold">Shapes</div>
      <div className="w-full overflow-y-auto px-4 pt-4">
        <ItemElements
          items={shapeItems.value}
          assetFilter={shapeFilter.value}
        />
      </div>
    </>
  );
};
