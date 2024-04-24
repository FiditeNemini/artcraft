import { useEffect } from "react";
import { useSignals } from "@preact/signals-react/runtime";
import {
  selectedTab,
  sidePanelHeight,
  sidePanelVisible,
} from "~/pages/PageEnigma/store/sidePanel";
import { tabList } from "./tabList";
import { editorState, EditorStates } from "~/pages/PageEnigma/store/engine";
import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

export const SidePanelMenu = () => {
  useSignals();

  useEffect(() => {
    selectedTab.value = tabList[0];
  }, []);

  return (
    <div
      className={[
        "fixed bg-assets-background",
        "px-2 py-4",
        "overflow-y-auto",
      ].join(" ")}
      style={{
        height: sidePanelHeight.value,
        minWidth: 84,
        maxWidth: 84,
        right: 0,
        top: 70,
      }}>
      <div className="flex w-full flex-col gap-2">
        {tabList.map((tab) => (
          <button
            key={tab.value}
            className={[
              "flex flex-col items-center rounded-lg px-2 py-3 transition-all duration-200 hover:bg-assets-selectedTab/70",
              tab.value === selectedTab?.value?.value
                ? "bg-assets-selectedTab opacity-100 hover:bg-assets-selectedTab"
                : "opacity-60",
            ].join(" ")}
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
            }}>
            <div>
              <img src={tab.icon} alt={tab.title} width={20} height={20} />
            </div>
            <div className="" style={{ fontSize: 11 }}>
              {tab.title}
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
