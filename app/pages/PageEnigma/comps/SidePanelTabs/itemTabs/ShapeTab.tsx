import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { shapeFilter, shapeItems } from "~/pages/PageEnigma/store";

export const ShapeTab = () => {
  useSignals();

  return (
    <>
      <div className="p-2 text-base font-bold">Shapes</div>
      <div className="mt-2 w-full overflow-y-auto px-2 pt-2">
        <ItemElements
          items={shapeItems.value}
          assetFilter={shapeFilter.value}
        />
      </div>
    </>
  );
};
