import { Tabs } from "~/modules/Tabs";
import { TabStylization } from "./TabStylization";
import { AnimationElements } from "./AnimationElements";
import { AudioElements } from "~/pages/PageEnigma/comps/SidePanelTabs/AudioElements";

export const SidePanelTabs = () => {
  return (
    <Tabs
      tabs={[
        {
          header: "Animation",
          children: <AnimationElements />,
        },
        {
          header: "Camera",
          children: <p>Camera Tab</p>,
        },
        {
          header: "Audio",
          children: <AudioElements />,
        },
        {
          header: "Stylization",
          children: <TabStylization />,
        },
      ]}
    />
  );
};
