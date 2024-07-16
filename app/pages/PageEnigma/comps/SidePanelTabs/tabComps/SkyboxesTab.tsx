import { demoSkyboxItems } from "~/pages/PageEnigma/signals";

import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/sharedComps";
import { ItemElements } from "../sharedComps/ItemElements";

export const SkyboxesTab = () => {
  const displayedItems = demoSkyboxItems.value;

  return (
    <>
      <TabTitle title="Skyboxes" />
      <div className="w-full grow overflow-y-auto rounded px-4 pb-4">
        <ItemElements items={displayedItems} />
      </div>
    </>
  );
};
