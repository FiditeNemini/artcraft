import { TabTitle } from "~/pages/PageEnigma/comps/SidePanelTabs/comps/TabTitle";
import { StyleSelection } from "./StyleSelection";
import { Prompts } from "./Prompts";
import { StyleButtons } from "./StyleButtons";
import { sidePanelHeight } from "~/pages/PageEnigma/store";
import { useSignals } from "@preact/signals-react/runtime";

export function StylizeTab() {
  useSignals();

  return (
    <div
      className="flex flex-col gap-4"
      style={{ height: sidePanelHeight.value }}>
      <TabTitle title="Transform your animation with AI" />
      <StyleSelection />
      <Prompts />
      <StyleButtons />
    </div>
  );
}
