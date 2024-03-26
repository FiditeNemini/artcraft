import { Tabs } from "~/modules/Tabs";
import { TabStyling } from "./TabStyling";

export const SidePanelTabs = () => {
  return (
    <Tabs
      tabs={[
        {
          header: "Animation",
          children: (
            <div className="flex flex-wrap">
              <div
                id="ani-obj-1"
                className="block h-16 w-16 bg-brand-secondary-700"
              />
            </div>
          ),
        },
        {
          header: "Camera",
          children: <p>Camera Tab</p>,
        },
        {
          header: "Audio",
          children: <p>Audio Tab</p>,
        },
        {
          header: "Styling",
          children: <TabStyling />,
        },
      ]}
    />
  );
};
