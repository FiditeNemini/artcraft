import { useSignals } from "@preact/signals-react/runtime";
import { twMerge } from "tailwind-merge";
import { usePosthogFeatureFlag } from "~/hooks/usePosthogFeatureFlag";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { FeatureFlags, TabTitles } from "~/enums";
import { EditorStates } from "~/pages/PageEnigma/enums";
import { editorState } from "~/pages/PageEnigma/signals/engine";
import { sidePanelVisible } from "~/pages/PageEnigma/signals/sidePanel";

import Queue from "~/pages/PageEnigma/Queue/Queue";
import { QueueNames } from "~/pages/PageEnigma/Queue/QueueNames";
import { toEngineActions } from "~/pages/PageEnigma/Queue/toEngineActions";

import { TabItem } from "../SidePanel/tabList";
import { pageHeight } from "~/signals";

export const SidePanelMenu = ({
  tabs,
  selectTab,
  selectedTab,
}: {
  tabs: TabItem[];
  selectTab: (newSelectedTab: TabItem) => void;
  selectedTab: TabItem;
}) => {
  useSignals();
  const showSetsTab = usePosthogFeatureFlag(FeatureFlags.SHOW_SETS_TAB);
  const showImagePlaneTab = usePosthogFeatureFlag(
    FeatureFlags.SHOW_IMAGEPLANE_TAB,
  );
  return (
    <div
      className={twMerge(
        "fixed z-20 bg-assets-background",
        "right-0 top-[64px] w-[84px] px-2 py-2",
        "overflow-y-auto",
      )}
      style={{
        height: pageHeight.value - 64,
      }}
    >
      <div className="flex w-full flex-col gap-2">
        {(tabs ?? []).map((tab) => {
          if (tab.title === TabTitles.SET_OBJECTS && !showSetsTab) {
            return;
          }
          if (tab.title === TabTitles.IMAGE_PLANE && !showImagePlaneTab) {
            return;
          }
          return (
            <button
              key={tab.title}
              className={twMerge([
                "flex flex-col items-center rounded-lg border-2 border-transparent px-2 py-3 transition-all duration-200 hover:bg-assets-selectedTab/70",
                tab.title === selectedTab.title
                  ? "bg-assets-selectedTab opacity-100 hover:bg-assets-selectedTab"
                  : "opacity-60",
                tab.title === TabTitles.STYLIZE &&
                  "bg-brand-primary font-medium opacity-90 hover:border-white/25 hover:bg-brand-primary hover:opacity-100",
                tab.title === selectedTab.title &&
                tab.title === TabTitles.STYLIZE
                  ? "border-white/50 opacity-100 hover:border-white/50"
                  : "",
              ])}
              onClick={() => {
                selectTab(tab);
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
                <FontAwesomeIcon icon={tab.icon} size="lg" />
              </div>
              <div className="-mb-1 mt-1" style={{ fontSize: 11 }}>
                {tab.title}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
