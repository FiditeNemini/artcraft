import { Tabs } from "~/modules/Tabs";
import { TabStylization} from "./TabStylization";
import { ClipElements } from "./ClipElements";

export const SidePanelTabs = () => {
  return (
    <Tabs
      tabs={[
        {
          header: "Animation",
          children: <ClipElements />,
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
          header: "Stylization",
          children: <TabStylization />,
        },
      ]}
    />
  );
};
