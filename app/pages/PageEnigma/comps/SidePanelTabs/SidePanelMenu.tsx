import { useEffect, useLayoutEffect, useState } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import { twMerge } from "tailwind-merge";

import { AssetType } from "~/enums";
import { EditorStates } from "~/pages/PageEnigma/enums";
import { editorState } from "~/pages/PageEnigma/signals/engine";
import {
  selectedTab,
  sidePanelHeight,
  sidePanelVisible,
} from "~/pages/PageEnigma/signals/sidePanel";

import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

import { TabItem, tabList } from "./tabList";

export const SidePanelMenu = () => {
  useSignals();
  const [tabs, setTabs] = useState<TabItem[]>();
  useLayoutEffect(() => {
    setTabs(tabList);
  }, []);

  useEffect(() => {
    if (tabs) {
      selectedTab.value = tabs[0];
    }
  }, [tabs]);

  return (
    <div
      className={[
        "fixed bg-assets-background",
        "px-2 py-2",
        "overflow-y-auto",
      ].join(" ")}
      style={{
        height: sidePanelHeight.value,
        minWidth: 84,
        maxWidth: 84,
        right: 0,
        top: 64,
      }}
    >
      <div className="flex w-full flex-col gap-2">
        {(tabs ?? []).map((tab) => (
          <button
            key={tab.value}
            className={twMerge([
              "flex flex-col items-center rounded-lg border-2 border-transparent px-2 py-3 transition-all duration-200 hover:bg-assets-selectedTab/70",
              tab.value === selectedTab?.value?.value
                ? "bg-assets-selectedTab opacity-100 hover:bg-assets-selectedTab"
                : "opacity-60",
              tab.value === AssetType.STYLE &&
                "bg-brand-primary font-medium opacity-90 hover:border-white/25 hover:bg-brand-primary hover:opacity-100",
              tab.value === selectedTab?.value?.value &&
              tab.value === AssetType.STYLE
                ? "border-white/50 opacity-100 hover:border-white/50"
                : "",
            ])}
            onClick={() => {
              selectedTab.value = tab;
              if (!sidePanelVisible.value) {
                sidePanelVisible.value = true;
              }
              if (editorState.value === EditorStates.PREVIEW) {
                Queue.publish({
                  queueName: QueueNames.TO_ENGINE,
                  action: toEngineActions.ENTER_EDIT_STATE,
                  data: null,
                });
              }
            }}
          >
            <div>
              <img src={tab.icon} alt={tab.title} width={20} height={20} />
            </div>
            <div className="-mb-1 mt-1" style={{ fontSize: 11 }}>
              {tab.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
