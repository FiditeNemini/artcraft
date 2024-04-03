import { Tabs } from "~/modules/Tabs";
import { TabStylization } from "./TabStylization";
import { AnimationElements } from "./AnimationElements";
import { TabAudio } from "~/pages/PageEnigma/comps/SidePanelTabs/TabAudio";

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
          children: <TabAudio />,
        },
        {
          header: "Stylization",
          children: <TabStylization />,
        },
      ]}
    />
  );
};
