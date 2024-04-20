import { useSignals } from "@preact/signals-react/runtime";
import { ItemElements } from "~/pages/PageEnigma/comps/SidePanelTabs/itemTabs/ItemElements";
import { shapeFilter, shapeItems } from "~/pages/PageEnigma/store";
import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";

export const ShapeTab = () => {
  useSignals();

  return (
    <div className="w-full overflow-x-auto p-4 pb-0">
      <TabTitle title="Shapes" />
      <div className="mb-4 flex justify-start gap-2">
        <ItemElements
          items={shapeItems.value}
          assetFilter={shapeFilter.value}
        />
      </div>
    </div>
  );
};
