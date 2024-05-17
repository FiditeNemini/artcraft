import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import { StyleSelection } from "./StyleSelection";
import { Prompts } from "./Prompts";
import { StyleButtons } from "./StyleButtons";
import { sidePanelHeight } from "~/pages/PageEnigma/signals";
import { useSignals } from "@preact/signals-react/runtime";
import { useState } from "react";
import { ArtStyle } from "~/pages/PageEnigma/js/api_manager";
import { styleList } from "~/pages/PageEnigma/styleList";

export function StylizeTab() {
  useSignals();
  const [selection, setSelection] = useState<ArtStyle>(styleList[0].type);

  return (
    <div
      className="flex flex-col gap-3 overflow-x-hidden pb-5"
      style={{ height: sidePanelHeight.value }}
    >
      <TabTitle title="Transform your animation with AI" />
      <StyleSelection selection={selection} setSelection={setSelection} />
      <Prompts selection={selection} />
      <StyleButtons />
    </div>
  );
}
